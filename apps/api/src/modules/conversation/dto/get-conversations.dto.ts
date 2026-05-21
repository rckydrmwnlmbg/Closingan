import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ConversationState, AiMode, HeatTier } from '@prisma/client';

export class GetConversationsQueryDto {
  @IsOptional()
  @IsEnum(ConversationState)
  state?: ConversationState;

  @IsOptional()
  @IsEnum(AiMode)
  aiMode?: AiMode;

  @IsOptional()
  @IsEnum(HeatTier)
  heatTier?: HeatTier;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
