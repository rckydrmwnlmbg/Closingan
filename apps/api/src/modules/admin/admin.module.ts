import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AiSafetyService } from '../../ai/ai-safety.service';
import { NotificationProcessor } from './notification.processor';
import { ChurnService } from './churn.service';
import { NotificationCronService } from './notification.cron';
import { WhatsappModule } from '../../whatsapp/whatsapp.module';
import { BullModule } from '@nestjs/bullmq';
import { QueueName } from '@prisma/client';

import { MailModule } from '../../mail/mail.module';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'ai-reply' },
      { name: 'hot-lead' },
      { name: 'notification' }
    ),
    WhatsappModule,
    MailModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, AiSafetyService, NotificationProcessor, ChurnService, NotificationCronService],
  exports: [AdminService, ChurnService],
})
export class AdminModule {}
