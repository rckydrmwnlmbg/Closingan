import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, DelayedError } from 'bullmq';
import { HotLeadService } from '../hot-lead.service';
import { ClsService } from 'nestjs-cls';
import { AiAnalysisJobData } from '../../../queue/interfaces/job-data.interface';
import { AppException } from '../../../common/exceptions/app.exception';
import { RedisService } from '../../../common/redis/redis.service';

@Processor('ai-analysis', {
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 1000,
  },
})
export class AiAnalysisProcessor extends WorkerHost {
  private readonly logger = new Logger(AiAnalysisProcessor.name);

  constructor(
    private readonly hotLeadService: HotLeadService,
    private readonly cls: ClsService,
    private readonly redisService: RedisService,
  ) {
    super();
  }

  async process(
    job: Job<AiAnalysisJobData, unknown, string>,
  ): Promise<unknown> {
    const { tenantId, conversationId, messageContent } = job.data;

    if (!tenantId || !conversationId || !messageContent) {
      this.logger.warn(`Invalid job data for ai-analysis: ${job.id}`);
      return;
    }

    // Queue Isolation / Noisy Neighbor prevention
    const MAX_CONCURRENT_PER_TENANT = 2;
    const activeJobsKey = `tenant:${tenantId}:aianalysis-active`;
    const activeCount = await this.redisService.incr(activeJobsKey);

    if (activeCount === 1) {
      await this.redisService.expire(activeJobsKey, 60);
    }

    if (activeCount > MAX_CONCURRENT_PER_TENANT) {
      await this.redisService.decr(activeJobsKey);
      this.logger.warn(
        `Tenant ${tenantId} exceeded AI analysis concurrency limit (${MAX_CONCURRENT_PER_TENANT}). Delaying job ${job.id}.`,
      );
      await job.moveToDelayed(Date.now() + 2000, job.token);
      throw new DelayedError();
    }

    try {
      // MEMORY REQUIREMENT: Background workers MUST explicitly wrap execution in cls.run()
      // and manually inject context variables like tenantId to maintain isolation.
      return await this.cls.run(async () => {
        this.cls.set('tenantId', tenantId);

        this.logger.log(
          `Processing AI analysis for conversation: ${conversationId}`,
        );
        try {
          let timeoutId: NodeJS.Timeout;
          const timeout = new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => {
              reject(
                new AppException('AI_TIMEOUT', 'AI analysis timed out', 504),
              );
            }, 25000);
          });

          try {
            await Promise.race([
              this.hotLeadService.analyzeLead(conversationId, messageContent),
              timeout,
            ]);
          } finally {
            clearTimeout(timeoutId!);
          }
        } catch (error) {
          this.logger.error(
            `Error during AI analysis for ${conversationId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      return;
    }
    this.logger.error(
      `Job ${job.id} of type ${job.name} failed with error: ${error.message}`,
      error.stack,
    );
  }
}
