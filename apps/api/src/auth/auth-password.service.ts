/* eslint-disable @typescript-eslint/await-thenable */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcryptjs';
import { AppException } from '../common/exceptions/app.exception';
import * as crypto from 'crypto';
import { AuditService } from '../common/audit/audit.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuthPasswordService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly auditService: AuditService,
  ) {}

  async forgotPassword(email: string, tenantId?: string) {
    const whereClause: Record<string, string> = { email };
    if (tenantId) whereClause.tenantId = tenantId;
    const user = await this.prisma.user.findFirst({ where: whereClause });

    // Always return same response to prevent email enumeration
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
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

    const user = await this.prisma.user.findFirst({
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
}
