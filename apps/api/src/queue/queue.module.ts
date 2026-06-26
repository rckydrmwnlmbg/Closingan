import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiReplyWorker } from './workers/ai-reply.worker';
import { BlastWorker } from './workers/blast.worker';
import { IncomingMessagesWorker } from './workers/incoming-messages.worker';
import { MessageQueueService } from './services/message-queue.service';

import { AiModule } from '../ai/ai.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { WebsocketModule } from '../modules/websocket/websocket.module';
import { KnowledgeModule } from '../modules/knowledge/knowledge.module';

@Module({
  imports: [
    AiModule,
    WhatsappModule,
    WebsocketModule,
    KnowledgeModule,
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
            retryStrategy: (times) => {
              return Math.min(times * 1000, 5000);
            },
          },
          defaultJobOptions: {
            removeOnComplete: 100,
            removeOnFail: 500,
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
      { name: 'blast-campaign' },
      { name: 'incoming-messages-queue' },
    ),
  ],
  providers: [
    AiReplyWorker,
    BlastWorker,
    IncomingMessagesWorker,
    MessageQueueService,
  ],
  exports: [BullModule, MessageQueueService],
})
export class QueueModule {}
