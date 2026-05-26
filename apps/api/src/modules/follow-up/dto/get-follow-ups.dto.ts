import { IsEnum, IsOptional } from 'class-validator';
import { FollowUpStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class GetFollowUpsDto extends PaginationDto {
  @IsOptional()
  @IsEnum(FollowUpStatus)
  status?: FollowUpStatus;
}
