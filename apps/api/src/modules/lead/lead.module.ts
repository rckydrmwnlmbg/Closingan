import { Module } from '@nestjs/common';
import { HotLeadService } from './hot-lead.service';
import { BullModule } from '@nestjs/bullmq';
import { AiModule } from '../../ai/ai.module';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AiAnalysisProcessor } from './queue/ai-analysis.processor';

@Module({
  imports: [
    AiModule,
    PrismaModule,
    BullModule.registerQueue(
      { name: 'hot-lead' },
      { name: 'ai-analysis' }
    ),
  ],
  providers: [HotLeadService, AiAnalysisProcessor],
  exports: [HotLeadService],
})
export class LeadModule {}
