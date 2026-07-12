import { Controller, Get, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantId } from '../../../common/decorators/tenant.decorator';
import { ResponseBuilder } from '../../../common/helpers/response.builder';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { MidtransPaymentService } from '../services/midtrans-payment.service';
import { SubscriptionService } from '../services/subscription.service';
import { AppException } from '../../../common/exceptions/app.exception';
import { AuditService } from '../../../common/audit/audit.service';
import { AuditAction, SubscriptionPlan } from '@prisma/client';

/** Pricing table — amounts in integer IDR (no decimal) */
const PLAN_PRICING: Record<string, { amount: number; tokenQuota: number; label: string }> = {
  STARTER: { amount: 99000, tokenQuota: 100000, label: 'Starter — Rp 99.000/bulan' },
  PRO: { amount: 249000, tokenQuota: 500000, label: 'Pro — Rp 249.000/bulan' },
  ELITE: { amount: 499000, tokenQuota: 2000000, label: 'Elite — Rp 499.000/bulan' },
};

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingApiController {
  private readonly logger = new Logger(BillingApiController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly midtransPaymentService: MidtransPaymentService,
    private readonly subscriptionService: SubscriptionService,
    private readonly auditService: AuditService,
  ) {}

  @Get('subscription')
  async getSubscription(@TenantId() tenantId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });
    return ResponseBuilder.success(subscription);
  }

  @Get('plans')
  async getPlans() {
    const plans = Object.entries(PLAN_PRICING).map(([key, value]) => ({
      plan: key,
      amount: value.amount,
      tokenQuota: value.tokenQuota,
      label: value.label,
    }));
    return ResponseBuilder.success(plans);
  }

  @Get('invoices')
  async getInvoices(@TenantId() tenantId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return ResponseBuilder.list(invoices, { nextCursor: null, hasNext: false });
  }

  @Post('upgrade')
  async upgradePlan(
    @TenantId() tenantId: string,
    @Body('plan') plan: string,
  ) {
    // Validate plan
    const planKey = plan?.toUpperCase();
    if (!planKey || !PLAN_PRICING[planKey]) {
      throw new AppException(
        'VALIDATION_ERROR',
        `Plan tidak valid. Pilihan: ${Object.keys(PLAN_PRICING).join(', ')}`,
        422,
      );
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!subscription) {
      throw new AppException(
        'NOT_FOUND',
        'Subscription tidak ditemukan.',
        404,
      );
    }

    // Prevent downgrade during active period
    const currentPlanIndex = Object.keys(PLAN_PRICING).indexOf(subscription.plan);
    const targetPlanIndex = Object.keys(PLAN_PRICING).indexOf(planKey);
    if (targetPlanIndex <= currentPlanIndex && subscription.state === 'ACTIVE') {
      throw new AppException(
        'VALIDATION_ERROR',
        'Tidak bisa downgrade saat subscription masih aktif.',
        422,
      );
    }

    const pricing = PLAN_PRICING[planKey];

    // Create real invoice via Midtrans
    const result = await this.midtransPaymentService.createInvoice(
      tenantId,
      subscription.id,
      pricing.amount,
      `Upgrade ke ${pricing.label}`,
    );

    // Update subscription plan (will be activated after payment confirmed via webhook)
    await this.prisma.subscription.update({
      where: { tenantId },
      data: { plan: planKey as SubscriptionPlan },
    });

    await this.auditService.log({
      tenantId,
      action: AuditAction.SUBSCRIPTION_CHANGED,
      entityType: 'Subscription',
      entityId: subscription.id,
      metadata: {
        previousPlan: subscription.plan,
        newPlan: planKey,
        amount: pricing.amount,
        invoiceId: result.invoiceId,
      },
    });

    this.logger.log({
      tenantId,
      plan: planKey,
      amount: pricing.amount,
      invoiceId: result.invoiceId,
      msg: 'Plan upgrade invoice created',
    });

    return ResponseBuilder.success({
      invoiceId: result.invoiceId,
      paymentUrl: result.paymentUrl,
      plan: planKey,
      amount: pricing.amount,
    });
  }

  @Post('cancel')
  async cancelSubscription(@TenantId() tenantId: string) {
    const result = await this.subscriptionService.cancelSubscription(tenantId);
    return ResponseBuilder.success(result);
  }
}
