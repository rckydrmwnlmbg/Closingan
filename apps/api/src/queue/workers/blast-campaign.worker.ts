import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('blast-campaign', {
  concurrency: 1, // Low concurrency to not block ai-reply and hot-lead
  limiter: {
    max: 10, // 10 jobs
    duration: 1000, // per 1 second
  },
})
export class BlastCampaignWorker extends WorkerHost {
  private readonly logger = new Logger(BlastCampaignWorker.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(`Processing blast-campaign job ${job.id}`);
    // Dummy processing
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true };
  }
}