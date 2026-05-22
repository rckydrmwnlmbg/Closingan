import { Module } from '@nestjs/common';
import { HotLeadService } from './hot-lead.service';
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
    BullModule.registerQueue({ name: 'hot-lead' }, { name: 'ai-analysis' }),
  ],
  providers: [HotLeadService, AiAnalysisProcessor, HotLeadProcessor],
  exports: [HotLeadService],
})
export class LeadModule {}
