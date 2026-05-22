import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendOtp(to: string, otp: string) {
    // Keeping mock log for dev/test without full setup, but ready for real send
    this.logger.log(`[MOCK EMAIL] To: ${to} - Your OTP is: ${otp}`);
  }

  async sendPasswordReset(to: string, token: string) {
    this.logger.log(
      `[MOCK EMAIL] To: ${to} - Your Password Reset Token is: ${token}`,
    );
  }

  async sendHotLeadAlert(
    to: string,
    data: { leadName: string; tier: string; reasons: string[]; link: string },
  ) {
    try {
      const { leadName, tier, reasons, link } = data;
      const reasonsList = reasons.map((r) => `- ${r}`).join('\n');

      const textContent = `
Peringatan Hot Lead!

Prospek atas nama/nomor ${leadName} menunjukkan ketertarikan tinggi (${tier}).

Alasan ketertarikan:
${reasonsList}

Segera follow up prospek ini:
${link}
      `.trim();

      const htmlContent = `
        <h2>Peringatan Hot Lead!</h2>
        <p>Prospek atas nama/nomor <strong>${leadName}</strong> menunjukkan ketertarikan tinggi (<strong>${tier}</strong>).</p>
        <p><strong>Alasan ketertarikan:</strong></p>
        <ul>
          ${reasons.map((r) => `<li>${r}</li>`).join('')}
        </ul>
        <br/>
        <a href="${link}" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Follow Up Sekarang</a>
      `;

      // We wrap it in a condition so we only send real emails if SMTP is actually configured
      if (this.configService.get<string>('SMTP_USER')) {
        await this.transporter.sendMail({
          from: `"CLOSINGAN System" <${this.configService.get<string>('SMTP_USER')}>`,
          to,
          subject: `🚨 Hot Lead Alert: ${leadName} (${tier})`,
          text: textContent,
          html: htmlContent,
        });
        this.logger.log(`Hot lead email alert sent to ${to}`);
      } else {
        this.logger.log(
          `[MOCK EMAIL] Hot lead alert to ${to}:\n${textContent}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to send hot lead email to ${to}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
