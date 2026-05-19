import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiSafetyService } from './ai-safety.service';
import { OpenAiService } from './openai.service';

@Module({
  imports: [ConfigModule],
  providers: [
    AiSafetyService,
    {
      provide: 'AI_PROVIDER',
      useClass: OpenAiService,
    },
  ],
  exports: ['AI_PROVIDER', AiSafetyService],
})
export class AiModule {}
