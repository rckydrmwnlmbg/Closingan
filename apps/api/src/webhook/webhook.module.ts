import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { AuditModule } from '../common/audit/audit.module';
import { QueueModule } from '../queue/queue.module';
import { MessageIngestionService } from './ingestion/message-ingestion.service';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../common/prisma/prisma.module';
import { RedisModule } from '../common/redis/redis.module';

@Module({
  imports: [
    WhatsappModule,
    AuditModule,
    QueueModule,
    PrismaModule,
    RedisModule,
    BullModule.registerQueue({ name: 'ai-analysis' }),
    BullModule.registerQueue({ name: 'ai-reply' }),
  ],
  controllers: [WebhookController],
  providers: [WebhookService, MessageIngestionService],
})
export class WebhookModule {}
