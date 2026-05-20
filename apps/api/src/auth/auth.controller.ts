import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Ip,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponseBuilder } from '../common/helpers/response.builder';
import {
  RegisterDto,
  LoginDto,
  VerifyOtpDto,
  ResendOtpDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Audit } from '../common/decorators/audit.decorator';
import { AuditAction } from '@prisma/client';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Audit(AuditAction.USER_REGISTER)
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return ResponseBuilder.success(result);
  }

  @Post('verify-otp')
  @HttpCode(200)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const result = await this.authService.verifyOtp(dto);
    return ResponseBuilder.success(result);
  }

  @Post('resend-otp')
  @HttpCode(200)
  async resendOtp(@Body() dto: ResendOtpDto) {
    const result = await this.authService.resendOtp(dto.userId);
    return ResponseBuilder.success(result);
  }

  @Post('login')
  @HttpCode(200)
  @Audit(AuditAction.USER_LOGIN)
  async login(@Body() dto: LoginDto, @Ip() ip: string) {
    const result = await this.authService.login(dto, ip);
    return ResponseBuilder.success(result);
  }

  @Post('refresh')
  @HttpCode(200)
  async refreshTokens(@Body() dto: RefreshTokenDto) {
    const result = await this.authService.refreshTokens(dto);
    return ResponseBuilder.success(result);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Audit(AuditAction.USER_LOGOUT)
  async logout(@Body() dto: RefreshTokenDto) {
    await this.authService.logout(dto.refreshToken);
    return ResponseBuilder.success({ success: true });
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(dto.email);
    return ResponseBuilder.success(result);
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return ResponseBuilder.success({ success: true });
  }
}
