import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiSafetyService } from './ai-safety.service';
import { OpenAiService } from './openai.service';
import { ObservabilityModule } from '../observability/observability.module';
import { AiService } from './ai.service';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [ConfigModule, ObservabilityModule, PrismaModule],
  providers: [
    AiSafetyService,
    AiService,
    {
      provide: 'AI_PROVIDER',
      useClass: OpenAiService,
    },
  ],
  exports: ['AI_PROVIDER', AiSafetyService, AiService],
})
export class AiModule {}
