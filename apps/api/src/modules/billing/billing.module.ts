import { Module } from '@nestjs/common';
import { SubscriptionService } from './services/subscription.service';
import { MidtransPaymentService } from './services/midtrans-payment.service';
import { BillingController } from './billing.controller';
import { QuotaController } from './controllers/quota.controller';
import { QuotaService } from './services/quota.service';

@Module({
  controllers: [BillingController, QuotaController],
  providers: [SubscriptionService, MidtransPaymentService, QuotaService],
  exports: [SubscriptionService, QuotaService],
})
export class BillingModule {}
