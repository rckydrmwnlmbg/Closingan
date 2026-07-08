import { Logger } from '@nestjs/common';
import { WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { QueueName } from '@prisma/client';

export abstract class BaseWorker<DataType = any, ResultType = any, NameType extends string = string> extends WorkerHost {
  protected abstract readonly logger: Logger;
  protected abstract readonly prisma: PrismaService;
  protected abstract readonly cls: ClsService;
  protected abstract readonly queueName: QueueName | string;

  @OnWorkerEvent('failed')
  async onFailed(job: Job<DataType, ResultType, NameType>, error: Error) {
    if (
      error.message.includes('moveToDelayed') ||
      error.message.includes('DelayedError')
    ) {
      return; // Ignore noisy DelayedError logs from BullMQ
    }

    this.logger.error(
      `Job ${job.id} of type ${job.name} failed with error: ${error.message}`,
      error.stack,
    );

    if (job.attemptsMade >= (job.opts.attempts || 1)) {
      this.logger.error(
        `Job ${job.id} has exhausted all retries and moved to Dead Letter Queue behavior.`,
      );

      // Extract tenantId dynamically if it exists in jobData
      const jobDataAny = job.data as any;
      const tenantId = jobDataAny?.tenantId || null;

      await this.cls.run(async () => {
        try {
          await this.prisma.failedJob.create({
            data: {
              queueName: this.queueName as QueueName,
              jobId: job.id || 'unknown',
              jobData: job.data as unknown as import('@prisma/client').Prisma.InputJsonValue,
              errorMessage: error.message,
              errorStack: error.stack,
              attemptCount: job.attemptsMade,
            },
          });

          await this.prisma.deadLetterLog.create({
            data: {
              tenantId,
              queueName: job.name,
              payload: (job.data || {}) as unknown as import('@prisma/client').Prisma.InputJsonValue,
              errorReason: error.message,
            },
          });
        } catch (e) {
          this.logger.error(
            `DLQ Save Error: ${e instanceof Error ? e.message : 'Unknown'}`,
          );
        }
      });
    }
  }
}
