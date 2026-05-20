import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { AuditModule } from '../common/audit/audit.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [WhatsappModule, AuditModule, QueueModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
