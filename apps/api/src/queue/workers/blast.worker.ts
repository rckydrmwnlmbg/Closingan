import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { BlastJobData } from '../interfaces/job-data.interface';

@Processor('blast', {
  concurrency: 1, // Low concurrency to not block ai-reply and hot-lead
  limiter: {
    max: 10, // 10 jobs
    duration: 1000, // per 1 second
  },
})
export class BlastWorker extends WorkerHost {
  private readonly logger = new Logger(BlastWorker.name);

  async process(job: Job<BlastJobData, unknown, string>): Promise<unknown> {
    this.logger.debug(`Processing blast job ${job.id}`);
    // Dummy processing
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true };
  }
}
