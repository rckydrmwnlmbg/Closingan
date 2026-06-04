import { Controller, Get, Post, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { QuotaService } from '../services/quota.service';
import { MidtransPaymentService } from '../services/midtrans-payment.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ClsService } from 'nestjs-cls';

@Controller('v1/quota')
@UseGuards(JwtAuthGuard)
export class QuotaController {
  constructor(
    private readonly quotaService: QuotaService,
    private readonly midtransPaymentService: MidtransPaymentService,
    private readonly cls: ClsService,
  ) {}

  @Get('status')
  async getQuotaStatus() {
    const tenantId = this.cls.get('tenantId');
    const tokenQuota = await this.quotaService.getTokenQuota(tenantId);

    let upsell: any = null;
    if (tokenQuota && tokenQuota.totalQuota > 0) {
      const usagePercentage = tokenQuota.usedQuota / tokenQuota.totalQuota;
      if (usagePercentage >= 0.9 && tokenQuota.extraCredits < 100) {
        upsell = {
          action: 'TOP_UP',
          packageName: '1000 AI Credits',
          price: 50000,
        };
      }
    }

    return {
      totalQuota: tokenQuota?.totalQuota || 0,
      messagesUsed: tokenQuota?.usedQuota || 0,
      extraCredits: tokenQuota?.extraCredits || 0,
      ...(upsell ? { upsell } : {}),
    };
  }

  @Post('buy-addon')
  async buyAddon() {
    const tenantId = this.cls.get('tenantId');

    // We need a subscriptionId for MidtransPaymentService.createInvoice
    // We will get it from the tenant's current subscription.
    const subscription = await this.quotaService.getSubscription(tenantId);
    if (!subscription) {
       throw new NotFoundException('Tenant has no active subscription');
    }

    const amount = 50000;
    const description = '1000 AI Credits Add-on';

    const result = await this.midtransPaymentService.createInvoice(
      tenantId,
      subscription.id,
      amount,
      description,
    );

    return {
      success: true,
      data: {
        paymentUrl: result.paymentUrl,
        invoiceId: result.invoiceId,
        token: result.paymentUrl?.split('/').pop(),
      },
    };
  }
}
