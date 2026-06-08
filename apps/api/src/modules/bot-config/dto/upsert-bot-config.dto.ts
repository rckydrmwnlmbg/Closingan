import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpsertBotConfigDto {
  @IsString()
  @IsNotEmpty()
  systemPrompt: string;

  @IsString()
  @IsNotEmpty()
  greetingMessage: string;

  @IsString()
  @IsOptional()
  businessContext?: string;
}
