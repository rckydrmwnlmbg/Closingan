import { IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class SnoozeFollowUpDto {
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  snoozedUntil: Date;
}
