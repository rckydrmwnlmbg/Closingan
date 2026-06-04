import { Module } from '@nestjs/common';
import { SubscriptionService } from './services/subscription.service';
import { MidtransPaymentService } from './services/midtrans-payment.service';
import { BillingController } from './billing.controller';
import { QuotaService } from './services/quota.service';

@Module({
  controllers: [BillingController],
  providers: [SubscriptionService, MidtransPaymentService, QuotaService],
  exports: [SubscriptionService, QuotaService],
})
export class BillingModule {}
