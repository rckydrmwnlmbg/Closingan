import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

interface IncomingMessageJobData {
  tenantId: string;
  payload: any;
}

@Processor('incoming-messages', {
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 1000,
  },
})
export class IncomingMessagesWorker extends WorkerHost {
  private readonly logger = new Logger(IncomingMessagesWorker.name);

  constructor(private readonly cls: ClsService) {
    super();
  }

  async process(
    job: Job<IncomingMessageJobData, unknown, string>,
  ): Promise<unknown> {
    this.logger.debug(`Processing incoming-messages job ${job.id}`);
    const { tenantId, payload } = job.data;

    return this.cls.run(async () => {
      this.cls.set('tenantId', tenantId);

      try {
        // Placeholder for future consumption logic
        this.logger.log(`Received message for tenant ${tenantId}`);

        return { success: true };
      } catch (error: any) {
        this.logger.error(
          { jobId: job.id, error: error.message },
          `Failed incoming-messages job ${job.id}: ${error.message}`,
        );
        throw error;
      }
    });
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} of type ${job.name} failed with error: ${error.message}`,
      error.stack,
    );
  }
}
