import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto, VerifyOtpDto, RefreshTokenDto } from './dto';
import { AppException } from '../common/exceptions/app.exception';
import { AuditService } from '../common/audit/audit.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly auditService: AuditService,
  ) {}

  private isDisposableEmail(email: string): boolean {
    const disposableDomains = ['mailinator.com', 'guerrillamail.com']; // Extend this list
    const domain = email.split('@')[1];
    return disposableDomains.includes(domain);
  }

  async register(dto: RegisterDto) {
    if (this.isDisposableEmail(dto.email)) {
      throw new AppException(
        'EMAIL_DISPOSABLE',
        'Email disposable tidak diizinkan.',
        422,
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new AppException(
        'EMAIL_ALREADY_EXISTS',
        'Email sudah terdaftar.',
        409,
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.$transaction(async (prisma) => {
      const tenantName = dto.fullName.split(' ')[0] + "'s Tenant";

      const tenant = await prisma.tenant.create({
        data: {
          name: tenantName,
        },
      });

      return prisma.user.create({
        data: {
          email: dto.email,
          passwordHash,
          fullName: dto.fullName,
          tenantId: tenant.id,
          role: 'ADMIN',
        },
      });
    });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.otpCode.create({
      data: {
        userId: user.id,
        code: otp,
        type: 'EMAIL_VERIFY',
        expiresAt,
      },
    });

    await this.mailService.sendOtp(dto.email, otp);

    await this.auditService.log({
      tenantId: user.tenantId,
      userId: user.id,
      action: AuditAction.USER_REGISTER,
      entityType: 'User',
      entityId: user.id,
    });

    return {
      userId: user.id,
      email: user.email,
      message: 'OTP verifikasi telah dikirim ke email kamu.',
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        userId: dto.userId,
        type: 'EMAIL_VERIFY',
        usedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new AppException(
        'OTP_INVALID',
        'OTP salah atau tidak ditemukan.',
        422,
      );
    }

    if (otpRecord.expiresAt < new Date()) {
      throw new AppException('OTP_EXPIRED', 'OTP sudah expired.', 422);
    }

    if (otpRecord.attempts >= 3) {
      const lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock 15 mins
      await this.prisma.user.update({
        where: { id: dto.userId },
        data: { lockedUntil: lockUntil },
      });
      throw new AppException(
        'OTP_MAX_ATTEMPTS',
        'Terlalu banyak percobaan OTP, coba lagi nanti.',
        429,
      );
    }

    if (otpRecord.code !== dto.code) {
      await this.prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      throw new AppException('OTP_INVALID', 'OTP salah.', 422);
    }

    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { usedAt: new Date() },
    });

    await this.prisma.user.update({
      where: { id: dto.userId },
      data: { emailVerified: true },
    });

    return { verified: true };
  }

  async resendOtp(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppException('USER_NOT_FOUND', 'User tidak ditemukan.', 404);
    }

    // Invalidate old pending OTPs
    await this.prisma.otpCode.updateMany({
      where: { userId, type: 'EMAIL_VERIFY', usedAt: null },
      data: { usedAt: new Date() },
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.otpCode.create({
      data: {
        userId: user.id,
        code: otp,
        type: 'EMAIL_VERIFY',
        expiresAt,
      },
    });

    await this.mailService.sendOtp(user.email, otp);

    return { message: 'OTP baru telah dikirim.' };
  }

  async login(dto: LoginDto, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new AppException(
        'USER_NOT_FOUND',
        'Email atau password salah.',
        404,
      );
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AppException('ACCOUNT_LOCKED', 'Akun terkunci sementara.', 423);
    }

    if (!user.emailVerified) {
      throw new AppException(
        'EMAIL_NOT_VERIFIED',
        'Email belum diverifikasi.',
        403,
      );
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      const attempts = user.loginAttempts + 1;
      let lockedUntil: Date | null = null;
      if (attempts >= 3) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await this.prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: attempts, lockedUntil },
      });
      throw new AppException(
        'USER_NOT_FOUND',
        'Email atau password salah.',
        404,
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

    await this.auditService.log({
      tenantId: user.tenantId,
      userId: user.id,
      action: AuditAction.USER_LOGIN,
      ipAddress: ipAddress,
    });

    return this.generateTokens(user);
  }

  async refreshTokens(dto: RefreshTokenDto) {
    const record = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
      include: { user: true },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      // Security feature: if used token is presented, revoke all sessions?
      // Minimal requirement: reject
      throw new AppException(
        'UNAUTHORIZED',
        'Token tidak valid atau expired.',
        401,
      );
    }

    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return this.generateTokens(record.user);
  }

  async logout(refreshToken: string) {
    const record = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (record && !record.usedAt) {
      await this.prisma.refreshToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      });

      await this.auditService.log({
        tenantId: record.user.tenantId,
        userId: record.user.id,
        action: AuditAction.USER_LOGOUT,
      });
    }

    return true;
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Always return same response to prevent email enumeration
    if (user) {
      const token =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

      await this.prisma.otpCode.create({
        data: {
          userId: user.id,
          code: token,
          type: 'PASSWORD_RESET',
          expiresAt,
        },
      });

      await this.mailService.sendPasswordReset(email, token);
    }

    return { message: 'Link reset dikirim ke email.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: { code: token, type: 'PASSWORD_RESET', usedAt: null },
    });

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      throw new AppException(
        'UNAUTHORIZED',
        'Token tidak valid atau expired.',
        401,
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    const user = await this.prisma.user.findUnique({
      where: { id: otpRecord.userId },
    });

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: otpRecord.userId },
        data: { passwordHash },
      }),
      this.prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { usedAt: new Date() },
      }),
      // Invalidate all refresh tokens for this user
      this.prisma.refreshToken.updateMany({
        where: { userId: otpRecord.userId, usedAt: null },
        data: { usedAt: new Date() },
      }),
    ]);

    if (user) {
      await this.auditService.log({
        tenantId: user.tenantId,
        userId: user.id,
        action: AuditAction.PASSWORD_CHANGED,
      });
    }

    return true;
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('JWT_ACCESS_SECRET') || 'default_secret',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'refresh_secret',
      expiresIn: '7d',
    });

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
}
