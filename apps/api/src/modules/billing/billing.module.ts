import { Module } from '@nestjs/common';
import { SubscriptionService } from './services/subscription.service';
import { MidtransPaymentService } from './services/midtrans-payment.service';
import { BillingController } from './billing.controller';
import { BillingApiController } from './controllers/billing-api.controller';
import { QuotaController } from './controllers/quota.controller';
import { QuotaService } from './services/quota.service';
import { AuditModule } from '../../common/audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [BillingController, BillingApiController, QuotaController],
  providers: [SubscriptionService, MidtransPaymentService, QuotaService],
  exports: [SubscriptionService, QuotaService, MidtransPaymentService],
})
export class BillingModule {}
