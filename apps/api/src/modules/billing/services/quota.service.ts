import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AppException } from '../../../common/exceptions/app.exception';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { TokenQuota } from '@prisma/client';

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

    const { usedQuota, totalQuota, graceBuffer, extraCredits } = tokenQuota;

    // Check if used quota is less than total + grace buffer + extraCredits
    return usedQuota < totalQuota + graceBuffer + extraCredits;
  }

  /**
   * Increment the used quota counter.
   */
  async incrementUsage(
    tenantId: string,
    messagesUsed: number = 1,
  ): Promise<void> {
    try {
      const tokenQuota = await this.prisma.tokenQuota.findUnique({
        where: { tenantId },
      });

      if (!tokenQuota) {
        throw new NotFoundException(
          `TokenQuota for tenant ${tenantId} not found`,
        );
      }

      // First deduct from regular quota (totalQuota)
      const availableRegularQuota =
        tokenQuota.totalQuota - tokenQuota.usedQuota;

      let usedQuotaIncrement = 0;
      let extraCreditsDecrement = 0;

      if (availableRegularQuota >= messagesUsed) {
        // Still within regular quota
        usedQuotaIncrement = messagesUsed;
      } else {
        // Regular quota exhausted, calculate how much overflows
        if (availableRegularQuota > 0) {
          usedQuotaIncrement = availableRegularQuota;
        }

        const remainingMessages = messagesUsed - usedQuotaIncrement;

        if (tokenQuota.extraCredits >= remainingMessages) {
          // Extra credits can cover the rest
          extraCreditsDecrement = remainingMessages;
        } else {
          // Extra credits exhausted, the rest goes to graceBuffer/overage
          extraCreditsDecrement = tokenQuota.extraCredits;
          usedQuotaIncrement += remainingMessages - tokenQuota.extraCredits;
        }
      }

      const updatedQuota = await this.prisma.tokenQuota.update({
        where: { tenantId },
        data: {
          usedQuota: {
            increment: usedQuotaIncrement,
          },
          extraCredits: {
            decrement: extraCreditsDecrement,
          },
          lastSyncAt: new Date(),
        },
      });

      this.logger.log({
        tenantId,
        messagesUsed,
        usedQuotaIncrement,
        extraCreditsDecrement,
        msg: `Incremented token quota usage`,
      });

      await this.checkThresholdsAndEmit(updatedQuota);
    } catch (error) {
      this.logger.error(
        `Failed to increment quota for tenant ${tenantId}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Add extra credits to a tenant's quota.
   * Can be hooked to one-time purchases (e.g. Midtrans webhook).
   */
  async addExtraCredits(tenantId: string, amount: number): Promise<void> {
    if (amount <= 0) {
      throw new AppException(
        'INVALID_AMOUNT',
        'Amount must be positive to add extra credits',
        400,
      );
    }

    try {
      await this.prisma.tokenQuota.update({
        where: { tenantId },
        data: {
          extraCredits: {
            increment: amount,
          },
          lastSyncAt: new Date(),
        },
      });

      this.logger.log({
        tenantId,
        amount,
        msg: `Added extra credits to tenant`,
      });
    } catch (error) {
      this.logger.error(
        `Failed to add extra credits for tenant ${tenantId}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async getTokenQuota(tenantId: string) {
    return this.prisma.tokenQuota.findUnique({
      where: { tenantId },
    });
  }

  async getSubscription(tenantId: string) {
    return this.prisma.subscription.findFirst({
      where: { tenantId },
    });
  }

  private async checkThresholdsAndEmit(tokenQuota: TokenQuota): Promise<void> {
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
