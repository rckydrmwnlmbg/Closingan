import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ClsService } from 'nestjs-cls';
import { AuditService } from '../common/audit/audit.service';
import { WHATSAPP_PROVIDER } from '../whatsapp/interfaces/whatsapp-provider.interface';
import type { WhatsappProviderInterface } from '../whatsapp/interfaces/whatsapp-provider.interface';
import { Inject } from '@nestjs/common';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @Inject(WHATSAPP_PROVIDER)
    private readonly whatsappProvider: WhatsappProviderInterface,
    private readonly cls: ClsService,
    private readonly auditService: AuditService,
    @InjectQueue('ai-reply') private readonly aiReplyQueue: Queue,
  ) {}

  async handleFonnteIncomingMessage(
    payload: any,
    signature: string,
    tenantId: string,
  ) {
    if (!tenantId) {
      throw new UnauthorizedException('Missing tenantId in webhook request');
    }

    // Set Tenant Isolation Context
    this.cls.set('tenantId', tenantId);

    // Validate Signature
    const isValid = this.whatsappProvider.validateWebhookSignature(
      payload,
      signature,
      tenantId,
    );

    if (!isValid) {
      this.logger.error(`Invalid webhook signature for Tenant: ${tenantId}`);
      throw new UnauthorizedException('Invalid webhook signature');
    }

    // Audit Logging
    await this.auditService.log({
      action: 'WA_CONNECTED' as any, // Closest match without schema modification, or we can use custom logging
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
