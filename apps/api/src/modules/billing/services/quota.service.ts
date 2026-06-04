import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class QuotaService {
  private readonly logger = new Logger(QuotaService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check if a tenant has remaining quota.
   * Considers totalQuota and graceBuffer.
   */
  async checkQuota(tenantId: string): Promise<boolean> {
    const tokenQuota = await this.prisma.tokenQuota.findUnique({
      where: { tenantId },
    });

    if (!tokenQuota) {
      this.logger.warn(
        `TokenQuota for tenant ${tenantId} not found, assuming no quota.`,
      );
      return false;
    }

    const { usedQuota, totalQuota, graceBuffer } = tokenQuota;

    // Check if used quota is less than total + grace buffer
    return usedQuota < totalQuota + graceBuffer;
  }

  /**
   * Increment the used quota counter.
   */
  async incrementUsage(
    tenantId: string,
    messagesUsed: number = 1,
  ): Promise<void> {
    try {
      await this.prisma.tokenQuota.update({
        where: { tenantId },
        data: {
          usedQuota: {
            increment: messagesUsed,
          },
          lastSyncAt: new Date(),
        },
      });
      this.logger.log({
        tenantId,
        messagesUsed,
        msg: `Incremented token quota usage`,
      });
    } catch (error) {
      this.logger.error(
        `Failed to increment quota for tenant ${tenantId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
