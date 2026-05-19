import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('health-check')
export class HealthCheckWorker extends WorkerHost {
  private readonly logger = new Logger(HealthCheckWorker.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(`Processing health-check job ${job.id}`);
    return { status: 'health check job processed correctly' };
  }
}