import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class QuotaService {
  private readonly logger = new Logger(QuotaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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
      const updatedQuota = await this.prisma.tokenQuota.update({
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

      await this.checkThresholdsAndEmit(updatedQuota);
    } catch (error) {
      this.logger.error(
        `Failed to increment quota for tenant ${tenantId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async checkThresholdsAndEmit(tokenQuota: any): Promise<void> {
    const { tenantId, usedQuota, totalQuota, warned85At, warned95At } =
      tokenQuota;

    // Prevent division by zero
    if (totalQuota <= 0) return;

    const usagePercentage = usedQuota / totalQuota;

    // Check 95% threshold
    if (usagePercentage >= 0.95 && !warned95At) {
      this.logger.warn({
        tenantId,
        usagePercentage: (usagePercentage * 100).toFixed(2),
        msg: `Quota usage hit 95% threshold for tenant ${tenantId}`,
      });
      this.eventEmitter.emit('quota.warning.95', {
        tenantId,
        usedQuota,
        totalQuota,
      });

      await this.prisma.tokenQuota.update({
        where: { tenantId },
        data: { warned95At: new Date() },
      });
    }
    // Check 80% threshold (using warned85At column as a proxy for the 80% warning flag as requested in DB schema, or we can use warned85At for 85%. The instructions ask for 80% warning.)
    else if (usagePercentage >= 0.8 && usagePercentage < 0.95 && !warned85At) {
      this.logger.warn({
        tenantId,
        usagePercentage: (usagePercentage * 100).toFixed(2),
        msg: `Quota usage hit 80% threshold for tenant ${tenantId}`,
      });
      this.eventEmitter.emit('quota.warning.80', {
        tenantId,
        usedQuota,
        totalQuota,
      });

      await this.prisma.tokenQuota.update({
        where: { tenantId },
        data: { warned85At: new Date() }, // Reusing the warned85At field for the 80% threshold to avoid schema migration
      });
    }
  }
}
