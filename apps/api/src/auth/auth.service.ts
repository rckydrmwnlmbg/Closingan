import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto } from './dto';
import { AppException } from '../common/exceptions/app.exception';
import { AuditService } from '../common/audit/audit.service';
import { AuditAction } from '@prisma/client';
import { AuthTokenService } from './auth-token.service';
import { AuthOtpService } from './auth-otp.service';
import disposableDomains = require('disposable-email-domains');

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly authTokenService: AuthTokenService,
    private readonly authOtpService: AuthOtpService,
  ) {}

  private isDisposableEmail(email: string): boolean {
    const domain = email.split('@')[1];
    return disposableDomains.includes(domain);
  }

  async register(dto: RegisterDto, fingerprintHash: string, tenantId?: string) {
    if (this.isDisposableEmail(dto.email)) {
      throw new AppException(
        'EMAIL_DISPOSABLE',
        'Email disposable tidak diizinkan.',
        422,
      );
    }

    const MAX_REGISTRATIONS = 2;
    const registrationCount = await this.prisma.auditLog.count({
      where: {
        action: AuditAction.USER_REGISTER,
        metadata: {
          path: ['fingerprintHash'],
          equals: fingerprintHash,
        },
      },
    });

    if (registrationCount >= MAX_REGISTRATIONS) {
      await this.prisma.abusiveClient.upsert({
        where: { fingerprintHash },
        create: {
          fingerprintHash,
          reason: 'Auto-banned: Exceeded maximum trial registrations',
        },
        update: {},
      });

      throw new AppException(
        'RATE_LIMITED',
        'Terlalu banyak pendaftaran dari perangkat ini.',
        429,
      );
    }

    const whereClause: Record<string, string> = { email: dto.email };
    if (tenantId) whereClause.tenantId = tenantId;
    const existingUser = await this.prisma.user.findFirst({
      where: whereClause,
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
      let referrerId: string | null = null;
      if (dto.referralCode) {
        const referrer = await prisma.tenant.findUnique({
          where: { referralCode: dto.referralCode },
        });
        if (referrer) {
          referrerId = referrer.id;
        }
      }

      const tenantName = dto.fullName.split(' ')[0] + "'s Tenant";

      const trialDays = referrerId ? 14 : 7;
      const trialEnds = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);

      const tenant = await prisma.tenant.create({
        data: {
          name: tenantName,
          subscription: {
            create: {
              state: 'TRIAL',
              plan: 'STARTER',
              trialEndsAt: trialEnds,
              currentPeriodStart: new Date(),
              currentPeriodEnd: trialEnds,
            }
          },
          tokenQuota: {
            create: {
              totalQuota: 50000, // default trial quota (~100-250 AI interactions)
              graceBuffer: Math.floor(50000 * 0.05),
              periodStart: new Date(),
              periodEnd: trialEnds,
            }
          }
        },
      });

      if (referrerId && dto.referralCode) {
        await prisma.referral.create({
          data: {
            tenantId: referrerId,
            referrerId: referrerId,
            receiverId: tenant.id,
            referralCode: dto.referralCode,
            status: 'SIGNED_UP',
          },
        });
      }

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

    // Delegate OTP generation
    await this.authOtpService.generateRegistrationOtp(user.id, dto.email);

    await this.auditService.log({
      tenantId: user.tenantId,
      userId: user.id,
      action: AuditAction.USER_REGISTER,
      entityType: 'User',
      entityId: user.id,
      metadata: { fingerprintHash },
    });

    return {
      userId: user.id,
      email: user.email,
      message: 'OTP verifikasi telah dikirim ke email kamu.',
    };
  }

  async login(
    dto: LoginDto,
    ipAddress: string,
    fingerprintHash: string,
    tenantId?: string,
  ) {
    const whereClause: Record<string, string> = { email: dto.email };
    if (tenantId) whereClause.tenantId = tenantId;
    const user = await this.prisma.user.findFirst({
      where: whereClause,
    });

    if (!user) {
      await this.auditService.log({
        tenantId: 'SYSTEM',
        action: AuditAction.USER_LOGIN_FAILED,
        ipAddress: ipAddress,
        metadata: { email: dto.email, reason: 'User not found' },
      });
      throw new AppException(
        'USER_NOT_FOUND',
        'Email atau password salah.',
        404,
      );
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await this.auditService.log({
        tenantId: user.tenantId,
        userId: user.id,
        action: AuditAction.USER_LOGIN_FAILED,
        ipAddress: ipAddress,
        metadata: { reason: 'Account locked' },
      });
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
      await this.auditService.log({
        tenantId: user.tenantId,
        userId: user.id,
        action: AuditAction.USER_LOGIN_FAILED,
        ipAddress: ipAddress,
        metadata: { reason: 'Incorrect password', attempts },
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
      metadata: { fingerprintHash },
    });

    return this.authTokenService.generateTokens(user);
  }
}
