import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('hot-lead', {
  concurrency: 50, // High concurrency for hot-lead
})
export class HotLeadWorker extends WorkerHost {
  private readonly logger = new Logger(HotLeadWorker.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(`Processing hot-lead job ${job.id}`);
    // Dummy processing
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { success: true };
  }
}