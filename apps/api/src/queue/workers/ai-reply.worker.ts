import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('ai-reply', {
  concurrency: 50, // High concurrency for ai-reply
})
export class AiReplyWorker extends WorkerHost {
  private readonly logger = new Logger(AiReplyWorker.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(`Processing ai-reply job ${job.id}`);
    // Dummy processing
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { success: true };
  }
}
