import { IsEnum } from 'class-validator';
import { AiMode } from '@prisma/client';

export class UpdateAiModeDto {
  @IsEnum(AiMode)
  aiMode: AiMode;
}
