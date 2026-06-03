import {
  Controller,
  Post,
  Body,
  Req,
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
    @Body() payload: any,
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
