import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import { RefreshTokenDto } from './dto';
import { AppException } from '../common/exceptions/app.exception';
import { AuditService } from '../common/audit/audit.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  async generateTokens(user: User) {
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

    await this.prisma.refreshToken.upsert({
      where: {
        token: refreshToken,
      },
      update: {
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        usedAt: null,
      },
      create: {
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

  async refreshTokens(dto: RefreshTokenDto) {
    const record = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
      include: { user: true },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
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
}
