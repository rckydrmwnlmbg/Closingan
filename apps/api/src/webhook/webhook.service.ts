import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ClsService } from 'nestjs-cls';
import { AuditService } from '../common/audit/audit.service';
import { WHATSAPP_PROVIDER } from '../whatsapp/interfaces/whatsapp-provider.interface';
import type { WhatsappProviderInterface } from '../whatsapp/interfaces/whatsapp-provider.interface';
import { Inject, OnModuleDestroy } from '@nestjs/common';
import { FonnteWebhookPayload } from '../whatsapp/interfaces/fonnte-webhook.interface';
import { PrismaService } from '../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class WebhookService implements OnModuleDestroy {
  private readonly logger = new Logger(WebhookService.name);
  private redisClient: Redis;

  constructor(
    @Inject(WHATSAPP_PROVIDER)
    private readonly whatsappProvider: WhatsappProviderInterface,
    private readonly cls: ClsService,
    private readonly auditService: AuditService,
    @InjectQueue('ai-reply') private readonly aiReplyQueue: Queue,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.redisClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
    });
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }

  async handleFonnteIncomingMessage(
    payload: FonnteWebhookPayload,
    signature: string,
  ) {
    // Validate Signature first
    const isValid = this.whatsappProvider.validateWebhookSignature(
      payload,
      signature,
    );

    if (!isValid) {
      this.logger.error(`Invalid webhook signature.`);
      throw new UnauthorizedException('Invalid webhook signature');
    }

    // Fetch the WhatsappSession using payload.device
    if (!payload.device) {
      this.logger.error('Missing device id in payload');
      throw new UnauthorizedException('Missing device identifier');
    }

    const session = await this.prisma.whatsappSession.findFirst({
      where: { phoneNumber: payload.device }, // Assuming Fonnte 'device' matches our phoneNumber
    });

    if (!session) {
      this.logger.error(`No tenant matches device: ${payload.device}`);
      throw new UnauthorizedException('Unknown device');
    }

    const tenantId = session.tenantId;

    // Set Tenant Isolation Context
    this.cls.set('tenantId', tenantId);

    // Webhook Idempotency Check using Redis
    if (payload.id) {
      const idempotencyKey = `tenant:${tenantId}:webhook:${payload.id}`;
      // Set key with 24 hours (86400 seconds) expiration if it doesn't exist ('NX')
      const isNew = await this.redisClient.set(idempotencyKey, '1', 'EX', 86400, 'NX');

      if (!isNew) {
        this.logger.warn(`Duplicate webhook payload received for Tenant: ${tenantId}, ID: ${payload.id}. Ignoring.`);
        return { success: true, duplicated: true };
      }
    }

    // Audit Logging
    await this.auditService.log({
      action: 'WA_CONNECTED', // Closest match without schema modification, or we can use custom logging
      entityType: 'WEBHOOK_PAYLOAD',
      entityId: payload.id || 'unknown',
    });

    this.logger.log(`Webhook received and verified for Tenant: ${tenantId}`);

    // Queue Resilience configuration: Exponential Backoff
    await this.aiReplyQueue.add(
      'process-message',
      {
        tenantId,
        payload,
      },
      {
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
