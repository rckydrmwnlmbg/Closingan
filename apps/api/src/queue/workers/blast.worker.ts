import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { BlastJobData } from '../interfaces/job-data.interface';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AppException } from '../../common/exceptions/app.exception';
import {
  WHATSAPP_PROVIDER,
  WhatsappProviderInterface,
} from '../../whatsapp/interfaces/whatsapp-provider.interface';
import { Inject } from '@nestjs/common';

@Processor('blast-campaign', {
  concurrency: 1, // Low concurrency to not block ai-reply and hot-lead
  limiter: {
    max: 5, // Pace rate limit: max 5 jobs per second
    duration: 1000,
  },
})
export class BlastWorker extends WorkerHost {
  private readonly logger = new Logger(BlastWorker.name);

  constructor(
    private readonly cls: ClsService,
    private readonly prisma: PrismaService,
    @Inject(WHATSAPP_PROVIDER)
    private readonly whatsappService: WhatsappProviderInterface,
  ) {
    super();
  }

  async process(job: Job<BlastJobData, unknown, string>): Promise<unknown> {
    this.logger.debug(`Processing blast job ${job.id}`);
    const { tenantId, campaignId, recipientId } = job.data;

    return this.cls.run(async () => {
      this.cls.set('tenantId', tenantId);

      // Fetch WhatsApp session first to verify it is CONNECTED
      const waSession = await this.prisma.whatsappSession.findUnique({
        where: { tenantId },
      });

      if (!waSession || waSession.state !== 'CONNECTED') {
        this.logger.warn(
          `Delaying blast job: WhatsApp session is not connected for tenant ${tenantId}`,
        );
        // Delaying using BullMQ native exponential backoff
        throw new AppException(
          'WHATSAPP_DISCONNECTED',
          `WhatsApp session is ${waSession?.state || 'missing'} for tenant ${tenantId}. Job delayed.`,
          503,
        );
      }

      const campaign = await this.prisma.campaign.findFirst({
        where: { id: campaignId, tenantId },
      });

      const recipient = await this.prisma.campaignRecipient.findFirst({
        where: { id: recipientId, tenantId, campaignId },
      });

      if (!campaign || !recipient) {
        this.logger.error(`Campaign or Recipient not found for job ${job.id}`);
        return { success: false, reason: 'Not found' };
      }

      if (recipient.status !== 'QUEUED') {
        this.logger.warn(
          `Recipient ${recipientId} is already ${recipient.status}, skipping.`,
        );
        return { success: true, skipped: true };
      }

      try {
        let messageText = campaign.messageTemplate;

        // Simple variable replacement
        if (recipient.variables && typeof recipient.variables === 'object') {
          const variables = recipient.variables as Record<string, string>;
          for (const key in variables) {
            messageText = messageText.replace(
              new RegExp(`{{${key}}}`, 'g'),
              variables[key],
            );
          }
        }

        // Send via WhatsApp
        await this.whatsappService.sendMessage({
          tenantId,
          to: recipient.phoneNormalized,
          message: messageText,
        });

        // Update recipient status
        await this.prisma.campaignRecipient.update({
          where: { id: recipientId },
          data: {
            status: 'SENT',
            sentAt: new Date(),
          },
        });

        // Increment campaign sent count
        await this.prisma.campaign.update({
          where: { id: campaignId },
          data: {
            sentCount: { increment: 1 },
          },
        });

        return { success: true };
      } catch (error: any) {
        this.logger.error(
          `Failed to send blast message to ${recipient.phoneNormalized}: ${error.message}`,
        );

        // Update recipient status to FAILED
        await this.prisma.campaignRecipient.update({
          where: { id: recipientId },
          data: {
            status: 'FAILED',
            failureReason: error.message,
          },
        });

        // Increment campaign failed count
        await this.prisma.campaign.update({
          where: { id: campaignId },
          data: {
            failedCount: { increment: 1 },
          },
        });

        throw error;
      }
    });
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<BlastJobData, unknown, string>, error: Error) {
    if (
      error.message.includes('moveToDelayed') ||
      error.message.includes('DelayedError')
    ) {
      return;
    }
    this.logger.error(
      `Job ${job.id} of type ${job.name} failed with error: ${error.message}`,
      error.stack,
    );

    if (job.attemptsMade >= (job.opts.attempts || 1)) {
      this.logger.error(
        `Job ${job.id} has exhausted all retries and moved to Dead Letter Queue behavior.`,
      );
      try {
        await this.prisma.deadLetterLog.create({
          data: {
            tenantId: job.data?.tenantId || null,
            queueName: job.name,
            payload: (job.data as any) || {},
            errorReason: error.message,
          },
        });
      } catch (err) {
        this.logger.error(
          `Failed to save DeadLetterLog for job ${job.id}`,
          err,
        );
      }
    }
  }
}
