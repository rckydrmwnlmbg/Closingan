import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto } from './dto';
import { AppException } from '../common/exceptions/app.exception';
import { AuditService } from '../common/audit/audit.service';
import { AuditAction } from '@prisma/client';
import { AuthTokenService } from './auth-token.service';
import { AuthOtpService } from './auth-otp.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly authTokenService: AuthTokenService,
    private readonly authOtpService: AuthOtpService,
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

    // Delegate OTP generation
    await this.authOtpService.generateRegistrationOtp(user.id, dto.email);

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

  async login(dto: LoginDto, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
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
    });

    return this.authTokenService.generateTokens(user);
  }
}
