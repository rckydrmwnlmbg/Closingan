import {
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
  MinLength,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  dealerName?: string;

  @IsOptional()
  @IsString()
  dealerCity?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  carBrands?: string[];

  @IsOptional()
  @IsString()
  bio?: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  oldPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
