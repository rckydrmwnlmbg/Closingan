import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job, DelayedError } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { RedisService } from '../../common/redis/redis.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { BaseWorker } from './base.worker';

interface IncomingMessageJobData {
  tenantId: string;
  payload: Record<string, unknown>;
}

@Processor('incoming-messages-queue', {
  concurrency: 10, // Match ai-reply concurrency
})
export class IncomingMessagesWorker extends BaseWorker<
  IncomingMessageJobData,
  unknown,
  string
> {
  protected readonly logger = new Logger(IncomingMessagesWorker.name);
  protected readonly queueName = 'incoming-messages-queue';

  constructor(
    protected readonly cls: ClsService,
    protected readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly aiService: AiService,
  ) {
    super();
  }

  async process(
    job: Job<IncomingMessageJobData, unknown, string>,
  ): Promise<unknown> {
    this.logger.debug(`Processing incoming-messages job ${job.id}`);
    const { tenantId } = job.data;

    // Queue Isolation / Noisy Neighbor prevention:
    // Limit max active concurrent jobs per tenant to prevent a single tenant from hogging the queue.
    const MAX_CONCURRENT_PER_TENANT = 2; // Leave at least 3 workers for others
    const activeJobsKey = `tenant:${tenantId}:incoming-active`;
    const activeCount = await this.redisService.incr(activeJobsKey);

    if (activeCount === 1) {
      await this.redisService.expire(activeJobsKey, 60); // Safety expire
    }

    if (activeCount > MAX_CONCURRENT_PER_TENANT) {
      await this.redisService.decr(activeJobsKey);
      this.logger.warn(
        `Tenant ${tenantId} exceeded concurrency limit (${MAX_CONCURRENT_PER_TENANT}). Delaying job ${job.id}.`,
      );
      await job.moveToDelayed(Date.now() + 2000, job.token);
      throw new DelayedError();
    }

    try {
      return await this.cls.run(async () => {
        this.cls.set('tenantId', tenantId);

        try {
          this.logger.log(`Received message for tenant ${tenantId}`);
          const conversationId = job.data.payload.conversationId as string;

          if (!conversationId) {
            this.logger.error(`Missing conversationId in job payload`);
            return { success: false, reason: 'missing_conversation_id' };
          }

          // Generate suggested reply
          const suggestedReply = await this.aiService.generateSuggestedReply(
            tenantId,
            conversationId,
          );

          // Save the suggested reply to the Message table
          const message = await this.prisma.message.create({
            data: {
              tenantId, // Strict isolation
              conversationId,
              senderType: 'AI',
              isAiGenerated: true,
              content: suggestedReply,
              deliveryState: 'QUEUED', // Not sending to Fonnte yet, just generating suggestion
            },
          });

          this.logger.log(
            `Generated AI suggested reply for conversation ${conversationId} (Tenant: ${tenantId})`,
          );

          return { success: true, messageId: message.id };
        } catch (error) {
          const err = error as Error;
          this.logger.error(
            { jobId: job.id, error: err.message },
            `Failed incoming-messages job ${job.id}: ${err.message}`,
          );
          throw error;
        }
      });
    } finally {
      await this.redisService.decr(activeJobsKey);
    }
  }
}
