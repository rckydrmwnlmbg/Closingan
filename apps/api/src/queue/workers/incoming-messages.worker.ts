import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job, DelayedError } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { RedisService } from '../../common/redis/redis.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AiService } from '../../ai/ai.service';

interface IncomingMessageJobData {
  tenantId: string;
  payload: any;
}

@Processor('incoming-messages-queue', {
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 1000,
  },
})
export class IncomingMessagesWorker extends WorkerHost {
  private readonly logger = new Logger(IncomingMessagesWorker.name);

  constructor(
    private readonly cls: ClsService,
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
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
          const { conversationId } = job.data.payload;

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
        } catch (error: any) {
          this.logger.error(
            { jobId: job.id, error: error.message },
            `Failed incoming-messages job ${job.id}: ${error.message}`,
          );
          throw error;
        }
      });
    } finally {
      await this.redisService.decr(activeJobsKey);
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error) {
    if (
      error.message.includes('moveToDelayed') ||
      error.message.includes('DelayedError')
    ) {
      return; // Ignore noisy DelayedError logs
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
            payload: job.data || {},
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
