import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ConversationState, AiMode, HeatTier } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class GetConversationsQueryDto extends PaginationDto {
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
}
