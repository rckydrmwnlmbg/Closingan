import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { MidtransPaymentService } from './services/midtrans-payment.service';

@Controller('webhook/payment')
export class BillingController {
  constructor(
    private readonly midtransPaymentService: MidtransPaymentService,
  ) {}

  @Post()
  async handlePaymentWebhook(
    @Body()
    payload: {
      order_id: string;
      status_code: string;
      gross_amount: string;
      transaction_status: string;
    },
    @Headers('x-midtrans-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Signature missing');
    }

    // In production, you would validate the webhook signature with your midtrans key.
    // For this boilerplate, the service handles it.
    await this.midtransPaymentService.handleWebhook(payload, signature);
    return { success: true };
  }
}
