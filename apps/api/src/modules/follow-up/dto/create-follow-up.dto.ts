import { IsString, IsNotEmpty, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { FollowUpUrgency } from '@prisma/client';

export class CreateFollowUpDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @Type(() => Date)
  @IsDate()
  dueAt: Date;

  @IsEnum(FollowUpUrgency)
  @IsNotEmpty()
  urgency: FollowUpUrgency;
}
