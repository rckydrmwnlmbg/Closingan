import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { QueueName } from '@prisma/client';
import { AiSafetyService } from './ai-safety.service';
import { OpenAiService } from './openai.service';
import { ObservabilityModule } from '../observability/observability.module';
import { AiService } from './ai.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { AiController } from './ai.controller';
import { SummaryProcessor } from './summary.processor';

@Module({
  imports: [
    ConfigModule, 
    ObservabilityModule, 
    PrismaModule,
    BullModule.registerQueue({
      name: QueueName.SUMMARY,
    }),
  ],
  controllers: [AiController],
  providers: [
    AiSafetyService,
    AiService,
    SummaryProcessor,
    {
      provide: 'AI_PROVIDER',
      useClass: OpenAiService,
    },
  ],
  exports: ['AI_PROVIDER', AiSafetyService, AiService],
})
export class AiModule {}
