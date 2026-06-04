import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { BlastJobData } from '../interfaces/job-data.interface';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AppException } from '../../common/exceptions/app.exception';

@Processor('blast-campaign', {
  concurrency: 1, // Low concurrency to not block ai-reply and hot-lead
  limiter: {
    max: 10, // 10 jobs
    duration: 1000, // per 1 second
  },
})
export class BlastWorker extends WorkerHost {
  private readonly logger = new Logger(BlastWorker.name);

  constructor(
    private readonly cls: ClsService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<BlastJobData, unknown, string>): Promise<unknown> {
    this.logger.debug(`Processing blast job ${job.id}`);
    const { tenantId } = job.data;

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
        throw new AppException(
          'WHATSAPP_DISCONNECTED',
          `WhatsApp session is ${waSession?.state || 'missing'} for tenant ${tenantId}. Job delayed.`,
          503,
        );
      }

      // Dummy processing
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true };
    });
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
