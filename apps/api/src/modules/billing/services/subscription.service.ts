/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuditService } from '../../../common/audit/audit.service';
import {
  SubscriptionState,
  AuditAction,
  SubscriptionPlan,
  Subscription,
} from '@prisma/client';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly cls: ClsService,
  ) {}

  /**
   * Handle Trial Expire -> PAST_DUE
   * Disables AI but keeps dashboard accessible
   */
  async handleTrialExpiry(tenantId: string): Promise<Subscription> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `Subscription for tenant ${tenantId} not found`,
      );
    }

    if (subscription.state !== SubscriptionState.TRIAL) {
      this.logger.warn(
        `Tenant ${tenantId} is not in TRIAL state, cannot expire trial.`,
      );
      return subscription;
    }

    const updated = await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        state: SubscriptionState.PAST_DUE,
        pastDueAt: new Date(),
      },
    });

    await this.audit.log({
      action: AuditAction.SUBSCRIPTION_CHANGED,
      entityType: 'Subscription',
      entityId: subscription.id,
      metadata: {
        previousState: SubscriptionState.TRIAL,
        newState: SubscriptionState.PAST_DUE,
        reason: 'trial_expired',
      },
      tenantId,
    });

    return updated;
  }

  /**
   * Handle Payment Success -> ACTIVE
   */
  async handlePaymentSuccess(
    tenantId: string,
    invoiceId: string,
  ): Promise<Subscription> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `Subscription for tenant ${tenantId} not found`,
      );
    }

    const now = new Date();
    // Usually a plan lasts 30 days
    const currentPeriodStart = now;
    const currentPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const updated = await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        state: SubscriptionState.ACTIVE,
        currentPeriodStart,
        currentPeriodEnd,
        pastDueAt: null,
        suspendedAt: null,
        cancelledAt: null,
      },
    });

    await this.audit.log({
      action: AuditAction.SUBSCRIPTION_CHANGED,
      entityType: 'Subscription',
      entityId: subscription.id,
      metadata: {
        previousState: subscription.state,
        newState: SubscriptionState.ACTIVE,
        reason: 'payment_success',
        invoiceId,
      },
      tenantId,
    });

    // Referral System Logic
    const referral = await this.prisma.referral.findFirst({
      where: {
        receiverId: tenantId,
        status: { in: ['SIGNED_UP', 'TRIAL_ACTIVE'] }
      }
    });

    if (referral) {
      await this.prisma.referral.update({
        where: { id: referral.id },
        data: {
          status: 'CONVERTED_TO_PAID',
          rewardGivenAt: new Date()
        }
      });

      const referrerSub = await this.prisma.subscription.findUnique({
        where: { tenantId: referral.referrerId }
      });

      if (referrerSub && referrerSub.currentPeriodEnd) {
        const newEndDate = new Date(referrerSub.currentPeriodEnd.getTime() + 7 * 24 * 60 * 60 * 1000);
        await this.prisma.subscription.update({
          where: { tenantId: referral.referrerId },
          data: { currentPeriodEnd: newEndDate, state: 'ACTIVE' }
        });
      }
    }

    return updated;
  }

  /**
   * Handle Payment Failure -> PAST_DUE
   */
  async handlePaymentFailure(
    tenantId: string,
    invoiceId: string,
  ): Promise<Subscription> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `Subscription for tenant ${tenantId} not found`,
      );
    }

    // Only transition if currently ACTIVE, otherwise it might already be PAST_DUE or SUSPENDED
    if (subscription.state === SubscriptionState.ACTIVE) {
      const updated = await this.prisma.subscription.update({
        where: { tenantId },
        data: {
          state: SubscriptionState.PAST_DUE,
          pastDueAt: new Date(),
        },
      });

      await this.audit.log({
        action: AuditAction.SUBSCRIPTION_CHANGED,
        entityType: 'Subscription',
        entityId: subscription.id,
        metadata: {
          previousState: subscription.state,
          newState: SubscriptionState.PAST_DUE,
          reason: 'payment_failed',
          invoiceId,
        },
        tenantId,
      });

      return updated;
    }

    return subscription;
  }

  /**
   * Handle PAST_DUE > 7 days -> SUSPENDED
   */
  async handlePastDueSuspension(tenantId: string): Promise<Subscription> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `Subscription for tenant ${tenantId} not found`,
      );
    }

    if (subscription.state !== SubscriptionState.PAST_DUE) {
      this.logger.warn(
        `Tenant ${tenantId} is not in PAST_DUE state, cannot suspend.`,
      );
      return subscription;
    }

    const updated = await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        state: SubscriptionState.SUSPENDED,
        suspendedAt: new Date(),
      },
    });

    await this.audit.log({
      action: AuditAction.SUBSCRIPTION_CHANGED,
      entityType: 'Subscription',
      entityId: subscription.id,
      metadata: {
        previousState: SubscriptionState.PAST_DUE,
        newState: SubscriptionState.SUSPENDED,
        reason: 'grace_period_expired',
      },
      tenantId,
    });

    return updated;
  }

  /**
   * Handle User Cancel -> CANCELLED
   */
  async cancelSubscription(tenantId: string): Promise<Subscription> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `Subscription for tenant ${tenantId} not found`,
      );
    }

    const updated = await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        state: SubscriptionState.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    await this.audit.log({
      action: AuditAction.SUBSCRIPTION_CHANGED,
      entityType: 'Subscription',
      entityId: subscription.id,
      metadata: {
        previousState: subscription.state,
        newState: SubscriptionState.CANCELLED,
        reason: 'user_requested',
      },
      tenantId,
    });

    return updated;
  }
}
