import { IsString, IsOptional } from 'class-validator';
import { FonnteWebhookPayload } from './fonnte-webhook.interface';

export class FonnteWebhookPayloadDto implements FonnteWebhookPayload {
  @IsString()
  device: string;

  @IsString()
  sender: string;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  text?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  from?: string;

  @IsString()
  @IsOptional()
  id?: string;
}