import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendOtp(to: string, otp: string) {
    // In a real application, connect to SMTP or SendGrid/Resend
    this.logger.log(`[MOCK EMAIL] To: ${to} - Your OTP is: ${otp}`);
  }

  async sendPasswordReset(to: string, token: string) {
    this.logger.log(
      `[MOCK EMAIL] To: ${to} - Your Password Reset Token is: ${token}`,
    );
  }
}
