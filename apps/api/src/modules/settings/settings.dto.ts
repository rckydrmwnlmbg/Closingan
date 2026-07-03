import { IsOptional, IsString, IsBoolean, IsArray } from 'class-validator';

export class UpdateAiSettingsDto {
  @IsOptional()
  @IsString()
  botName?: string;

  @IsOptional()
  @IsString()
  greetingMessage?: string;

  @IsOptional()
  @IsString()
  fallbackMessage?: string;

  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @IsOptional()
  @IsString()
  businessContext?: string;
}

export class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  hotLeadAlert?: boolean;

  @IsOptional()
  @IsBoolean()
  dailyDigest?: boolean;

  @IsOptional()
  @IsString()
  dailyDigestTime?: string;

  @IsOptional()
  @IsBoolean()
  weeklySummary?: boolean;

  @IsOptional()
  @IsBoolean()
  idleAlert?: boolean;

  @IsOptional()
  @IsBoolean()
  quotaWarning?: boolean;
}

export class AddSuppressionDto {
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class QuickReplyDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  shortcut?: string;
}
