import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { HotLeadJobData } from '../interfaces/job-data.interface';
import { ClsService } from 'nestjs-cls';

@Processor('hot-lead', {
  concurrency: 50, // High concurrency for hot-lead
})
export class HotLeadWorker extends WorkerHost {
  private readonly logger = new Logger(HotLeadWorker.name);

  constructor(private readonly cls: ClsService) {
    super();
  }

  async process(job: Job<HotLeadJobData, unknown, string>): Promise<unknown> {
    this.logger.debug(`Processing hot-lead job ${job.id}`);
    const { tenantId } = job.data;

    return this.cls.run(async () => {
      this.cls.set('tenantId', tenantId);

      // Dummy processing
      await new Promise((resolve) => setTimeout(resolve, 100));
      return { success: true };
    });
  }
}
