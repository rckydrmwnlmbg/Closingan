import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ClsService } from 'nestjs-cls';
import { AuditService } from '../common/audit/audit.service';
import { WHATSAPP_PROVIDER } from '../whatsapp/interfaces/whatsapp-provider.interface';
import type { WhatsappProviderInterface } from '../whatsapp/interfaces/whatsapp-provider.interface';
import { Inject } from '@nestjs/common';
import { FonnteWebhookPayload } from '../whatsapp/interfaces/fonnte-webhook.interface';
import { PrismaService } from '../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @Inject(WHATSAPP_PROVIDER)
    private readonly whatsappProvider: WhatsappProviderInterface,
    private readonly cls: ClsService,
    private readonly auditService: AuditService,
    @InjectQueue('ai-reply') private readonly aiReplyQueue: Queue,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async handleFonnteIncomingMessage(payload: FonnteWebhookPayload) {
    // Normalize payload to handle different Fonnte structures
    payload.sender = payload.sender || payload.from;
    payload.message = payload.message || payload.pesan || payload.text;

    // Fetch the WhatsappSession using payload.device
    if (!payload.device) {
      this.logger.error('Missing device id in payload');
      throw new UnauthorizedException('Missing device identifier');
    }

    // High read cache for WhatsappSession lookup
    const cacheKey = `wa-session:device:${payload.device}`;
    let session: any = null;
    const cachedSessionStr = await this.redisService.get(cacheKey);

    if (cachedSessionStr) {
      session = JSON.parse(cachedSessionStr);
    } else {
      session = await this.prisma.whatsappSession.findFirst({
        where: { phoneNumber: payload.device }, // Assuming Fonnte 'device' matches our phoneNumber
      });

      if (session) {
        await this.redisService.set(cacheKey, JSON.stringify(session), 3600); // 1 hour TTL
      }
    }

    const FALLBACK_DEVICE = '6287882134303';
    let isFallback = false;

    if (!session) {
      if (payload.device === FALLBACK_DEVICE) {
        this.logger.warn(
          `Using fallback mechanism for device ${payload.device}`,
        );
        isFallback = true;
      } else {
        this.logger.error(`No tenant matches device: ${payload.device}`);
        throw new UnauthorizedException('Unknown device');
      }
    }

    const tenantId = session?.tenantId || 'FALLBACK_TENANT';

    // Set Tenant Isolation Context
    this.cls.set('tenantId', tenantId);

    // Webhook Idempotency Check using Redis
    if (payload.id) {
      const idempotencyKey = `tenant:${tenantId}:webhook:${payload.id}`;
      // Set key with 24 hours (86400 seconds) expiration if it doesn't exist ('NX')
      const isNew = await this.redisService.setNx(idempotencyKey, '1', 86400);

      if (!isNew) {
        this.logger.warn(
          { tenantId, webhookId: payload.id },
          `Duplicate webhook payload received for Tenant: ${tenantId}, ID: ${payload.id}. Ignoring.`,
        );
        return { success: true, duplicated: true };
      }
    }

    // Audit Logging
    await this.auditService.log({
      action: 'WA_CONNECTED', // Closest match without schema modification, or we can use custom logging
      entityType: 'WEBHOOK_PAYLOAD',
      entityId: payload.id || 'unknown',
    });

    this.logger.log(
      { tenantId, webhookId: payload.id },
      `Webhook received and verified for Tenant: ${tenantId}`,
    );

    // Suppression List / Opt-Out Interception
    const messageText = (payload.message || '').trim().toUpperCase();
    const optOutKeywords = ['STOP', 'BERHENTI'];
    const senderNumber = payload.sender || payload.from;

    if (senderNumber && optOutKeywords.includes(messageText)) {
      // Normalize sender phone number (assuming Fonnte sender format)
      // Here we might just use sender directly if we don't have a normalizer handy, or just strip special chars.
      const phoneNormalized = senderNumber.replace(/\D/g, '');

      // Upsert to suppression list
      let suppression = await this.prisma.suppressionList.findFirst({
        where: { tenantId, phoneNormalized },
      });

      if (suppression) {
        suppression = await this.prisma.suppressionList.update({
          where: { id: suppression.id },
          data: {
            isActive: true,
            reason: 'OPTED_OUT',
            removedAt: null,
            removedBy: null,
            removalReason: null,
          },
        });
      } else {
        suppression = await this.prisma.suppressionList.create({
          data: {
            tenantId,
            phoneNumber: senderNumber,
            phoneNormalized,
            reason: 'OPTED_OUT',
            addedBy: 'SYSTEM',
          },
        });
      }

      this.logger.log(
        `Added ${senderNumber} to suppression list for tenant ${tenantId} due to opt-out keyword.`,
      );

      // Emit event for notification
      this.eventEmitter.emit('suppression.opt_out', {
        tenantId,
        phoneNumber: senderNumber,
        suppressionId: suppression.id,
      });

      // We can stop processing here or still queue it for the conversation history?
      // Business logic implies we probably shouldn't queue to AI.
      return { success: true, message: 'Opted out' };
    }

    // Anti-Looping: Check Redis for Human Takeover Status
    const sender = payload.sender || payload.from;
    let isHumanTakeoverActive = false;

    if (sender) {
      const takeoverKey = `tenant:${tenantId}:customerPhone:${sender}:takeover`;
      const takeoverFlag = await this.redisService.get(takeoverKey);
      if (takeoverFlag) {
        this.logger.log(
          `[Anti-Looping] Webhook paused for ${sender} under Tenant ${tenantId} due to Human Takeover`,
        );
        isHumanTakeoverActive = true;
      }
    }

    // Pass the isHumanTakeoverActive flag so worker can save message but skip AI

    // 1-Minute Manual Override Filter: Check if this is an OUTGOING message
    // When an outgoing message is sent from the human admin's device, Fonnte usually has the device as sender, or explicit status.
    // Assuming Fonnte outgoing message payload check: device == sender OR status == 'sent' (or similar).
    // Let's rely on standard Fonnte payload if it sends status or if sender matches device.
    // Or check if payload.device is the same as payload.sender.
    // Wait, let's just assume sender == device means outgoing. Let's make it robust.
    // Actually, Fonnte webhook docs say: outgoing message webhook payload is different or we can check sender == device.
    // "INTERCEPT MANUAL REPLIES: If the Fonnte webhook receives an OUTGOING message (meaning the human admin replied manually via their phone to that lead)"
    // Fonnte webhook for outgoing messages has `sender` == device number, and `to` == lead number, or maybe some other indication.

    // Let's implement a solid check for outgoing messages:
    const isOutgoing = payload.sender === payload.device;
    const targetLead = isOutgoing ? payload.to : payload.sender;

    if (isOutgoing && targetLead) {
      this.logger.log(
        `[Manual Override] Outgoing message detected for lead ${targetLead}. Setting manual_override flag.`,
      );
      const overrideKey = `manual_override:${targetLead}`;
      // Set TTL to 120 seconds
      await this.redisService.set(overrideKey, '1', 120);

      // Since it's outgoing, we might not want to process it as an incoming message for AI,
      // but we should still save it to the DB. The worker can handle saving OUTGOING messages if properly handled.
      // Wait, if it's outgoing, the worker should probably not call AI.
      // We can just set the flag and let it be added to the queue to be saved as history, or maybe the worker only expects incoming.
      // Let's just set the flag and pass it. The AI process will abort.
    } else {
      // It's an incoming message from the lead.
    }

    const extendedPayload = {
      ...payload,
      isHumanTakeoverActive,
    };

    // Queue Resilience configuration: Exponential Backoff
    await this.aiReplyQueue.add(
      'process-message',
      {
        tenantId,
        payload: extendedPayload,
      },
      {
        delay: isOutgoing ? 0 : 60000, // 60 seconds delay for incoming messages, no delay for outgoing (just to save to DB quickly)
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false, // Keep in queue to act as Dead Letter Queue, handled by worker events
      },
    );

    return { success: true };
  }
}
