import { IsOptional, IsString, IsArray, MinLength } from 'class-validator';

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
