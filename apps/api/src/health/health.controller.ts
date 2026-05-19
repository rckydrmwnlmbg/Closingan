import { Controller, Get } from '@nestjs/common';
import { ResponseBuilder } from '../common/helpers/response.builder';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('health')
export class HealthController {
  constructor(
    @InjectQueue('health-check') private readonly healthQueue: Queue,
  ) {}

  @Get()
  async check() {
    // Add a dummy job to ensure the queue is working
    await this.healthQueue.add('health-check-job', { timestamp: Date.now() });

    return ResponseBuilder.success({ status: 'ok', queue: 'job added' });
  }
}
