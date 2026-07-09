import { IsString, MinLength, MaxLength, IsNotEmpty, IsOptional } from 'class-validator';
import { EmailDto } from '../common/dto/email.dto';

export class RegisterDto extends EmailDto {
  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter.' })
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsOptional()
  referralCode?: string;
}

export class LoginDto extends EmailDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @MaxLength(6)
  @MinLength(6)
  @IsNotEmpty()
  code: string;
}

export class ResendOtpDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class ForgotPasswordDto extends EmailDto {}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter.' })
  @IsNotEmpty()
  newPassword: string;
}
