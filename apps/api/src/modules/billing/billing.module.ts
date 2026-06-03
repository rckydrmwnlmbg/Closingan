import { Module } from '@nestjs/common';
import { SubscriptionService } from './services/subscription.service';
import { MidtransPaymentService } from './services/midtrans-payment.service';
import { BillingController } from './billing.controller';

@Module({
  controllers: [BillingController],
  providers: [SubscriptionService, MidtransPaymentService],
  exports: [SubscriptionService],
})
export class BillingModule {}
