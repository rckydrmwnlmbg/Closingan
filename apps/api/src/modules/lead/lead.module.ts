import { Module } from '@nestjs/common';
import { HotLeadService } from './hot-lead.service';
import { LeadController } from './lead.controller';
import { BullModule } from '@nestjs/bullmq';
import { AiModule } from '../../ai/ai.module';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AiAnalysisProcessor } from './queue/ai-analysis.processor';
import { HotLeadProcessor } from './queue/hot-lead.processor';
import { WhatsappModule } from '../../whatsapp/whatsapp.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    AiModule,
    PrismaModule,
    WhatsappModule,
    WebsocketModule,
    BullModule.registerQueue(
      {
        name: 'hot-lead',
        defaultJobOptions: { removeOnComplete: 100, removeOnFail: 500 },
      },
      {
        name: 'ai-analysis',
        defaultJobOptions: { removeOnComplete: 100, removeOnFail: 500 },
      },
    ),
  ],
  controllers: [LeadController],
  providers: [HotLeadService, AiAnalysisProcessor, HotLeadProcessor],
  exports: [HotLeadService],
})
export class LeadModule {}
