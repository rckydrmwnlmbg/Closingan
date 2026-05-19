import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiReplyWorker } from './workers/ai-reply.worker';
import { HotLeadWorker } from './workers/hot-lead.worker';
import { BlastCampaignWorker } from './workers/blast-campaign.worker';
import { HealthCheckWorker } from './workers/health-check.worker';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
        const redisPort = configService.get<number>('REDIS_PORT', 6379);
        const redisPassword = configService.get<string>('REDIS_PASSWORD');

        return {
          connection: {
            host: redisHost,
            port: redisPort,
            password: redisPassword,
          },
        };
      },
    }),
    BullModule.registerQueue(
      {
        name: 'ai-reply',
      },
      {
        name: 'hot-lead',
      },
      {
        name: 'blast-campaign',
      },
      {
        name: 'health-check', // For dummy worker / health
      },
    ),
  ],
  providers: [
    AiReplyWorker,
    HotLeadWorker,
    BlastCampaignWorker,
    HealthCheckWorker,
  ],
  exports: [BullModule],
})
export class QueueModule {}