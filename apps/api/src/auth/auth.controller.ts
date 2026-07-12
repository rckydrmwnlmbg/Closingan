/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Headers,
  Ip,
  HttpCode,
  Res,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Response, Request } from 'express';
import { AppException } from '../common/exceptions/app.exception';
import { AuthService } from './auth.service';
import { AuthTokenService } from './auth-token.service';
import { AuthOtpService } from './auth-otp.service';
import { AuthPasswordService } from './auth-password.service';
import { AntiAbuseService } from '../common/guards/anti-abuse/anti-abuse.service';
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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authTokenService: AuthTokenService,
    private readonly authOtpService: AuthOtpService,
    private readonly authPasswordService: AuthPasswordService,
    private readonly antiAbuseService: AntiAbuseService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Audit(AuditAction.USER_REGISTER)
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    const fingerprintHash = this.antiAbuseService.generateFingerprint(req);
    const result = await this.authService.register(
      dto,
      fingerprintHash,
      tenantId,
    );
    return ResponseBuilder.success(result);
  }

  @Post('verify-otp')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(200)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const result = await this.authOtpService.verifyOtp(dto);
    return ResponseBuilder.success(result);
  }

  @Post('resend-otp')
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  @HttpCode(200)
  async resendOtp(
    @Body() dto: ResendOtpDto,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    const result = await this.authOtpService.resendOtp(dto.userId, tenantId);
    return ResponseBuilder.success(result);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(200)
  @Audit(AuditAction.USER_LOGIN)
  async login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    const fingerprintHash = this.antiAbuseService.generateFingerprint(req);
    const result = await this.authService.login(
      dto,
      ip,
      fingerprintHash,
      tenantId,
    );
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return ResponseBuilder.success(result);
  }

  @Post('refresh')
  @HttpCode(200)
  async refreshTokens(@Body() dto: RefreshTokenDto) {
    const result = await this.authTokenService.refreshTokens(dto);
    return ResponseBuilder.success(result);
  }

  @Post('silent-refresh')
  @HttpCode(200)
  async silentRefresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.refresh_token;
    if (!token) {
      throw new AppException('UNAUTHORIZED', 'No refresh token provided', 401);
    }
    const result = await this.authTokenService.refreshTokens({
      refreshToken: token,
    });
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return ResponseBuilder.success(result);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Audit(AuditAction.USER_LOGOUT)
  async logout(
    @Body() dto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const refreshToken = dto.refreshToken || req.cookies?.refresh_token;
    if (refreshToken) {
      await this.authTokenService.logout(refreshToken);
    }
    res.clearCookie('refresh_token');
    return ResponseBuilder.success({ success: true });
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    const result = await this.authPasswordService.forgotPassword(
      dto.email,
      tenantId,
    );
    return ResponseBuilder.success(result);
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authPasswordService.resetPassword(dto.token, dto.newPassword);
    return ResponseBuilder.success({ success: true });
  }
}
