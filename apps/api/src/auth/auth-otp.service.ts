import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { VerifyOtpDto } from './dto';
import { AppException } from '../common/exceptions/app.exception';

@Injectable()
export class AuthOtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async generateRegistrationOtp(userId: string, email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.otpCode.create({
      data: {
        userId,
        code: otp,
        type: 'EMAIL_VERIFY',
        expiresAt,
      },
    });

    await this.mailService.sendOtp(email, otp);
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
}
