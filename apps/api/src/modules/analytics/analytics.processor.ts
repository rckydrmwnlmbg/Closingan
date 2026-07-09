import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QueueName } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Processor(QueueName.ANALYTICS)
export class AnalyticsProcessor extends WorkerHost {
  private readonly logger = new Logger(AnalyticsProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const {
      tenantId,
      userId,
      eventName,
      sessionId,
      properties,
      ipAddress,
      userAgent,
    } = job.data;

    try {
      await this.prisma.analyticsEvent.create({
        data: {
          tenantId,
          userId,
          eventName,
          sessionId,
          properties,
          ipAddress,
          userAgent,
        },
      });
    } catch (error) {
      this.logger.error(`Error saving analytics event: ${eventName}`, error);
      throw error;
    }
  }
}
