import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SessionCleanupService {
  private readonly logger = new Logger(SessionCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async cleanupStaleSessions() {
    this.logger.debug('Running stale session cleanup task');

    try {
      // Find all sessions with expired QR codes
      const now = new Date();

      const result = await this.prisma.whatsappSession.updateMany({
        where: {
          qrExpiresAt: {
            lt: now,
          },
          qrCode: {
            not: null, // Only clear if there's a QR code
          },
        },
        data: {
          qrCode: null,
          qrExpiresAt: null,
          state: 'DISCONNECTED', // Reset state as QR is invalid
        },
      });

      if (result.count > 0) {
        this.logger.log(
          `Cleaned up ${result.count} stale WhatsApp sessions with expired QRs`,
        );
      }
    } catch (error: any) {
      this.logger.error(`Error during stale session cleanup: ${error.message}`);
    }
  }
}
