import { IsEnum, IsOptional } from 'class-validator';
import { HeatTier } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class GetLeadsQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(HeatTier)
  heatTier?: HeatTier;
}
