import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiReplyWorker } from './workers/ai-reply.worker';
import { HotLeadWorker } from './workers/hot-lead.worker';
import { BlastWorker } from './workers/blast.worker';

import { AiModule } from '../ai/ai.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [
    AiModule,
    WhatsappModule,
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
      { name: 'ai-reply' },
      { name: 'ai-analysis' },
      { name: 'hot-lead' },
      { name: 'escalation' },
      { name: 'follow-up' },
      { name: 'summary' },
      { name: 'analytics' },
      { name: 'blast' },
    ),
  ],
  providers: [
    AiReplyWorker,
    HotLeadWorker,
    BlastWorker,
  ],
  exports: [BullModule],
})
export class QueueModule {}
