import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Headers,
  Inject,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WHATSAPP_PROVIDER } from '../whatsapp/interfaces/whatsapp-provider.interface';
import type { WhatsappProviderInterface } from '../whatsapp/interfaces/whatsapp-provider.interface';
import { AppException } from '../common/exceptions/app.exception';
import type { Request } from 'express';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    @Inject(WHATSAPP_PROVIDER)
    private readonly whatsappProvider: WhatsappProviderInterface,
  ) {}

  @Post('fonnte')
  @HttpCode(HttpStatus.OK)
  async handleFonnteWebhook(
    @Body() payload: any,
    @Headers('x-fonnte-signature') signature: string,
    @Req() req: any,
  ) {
    // RISK-1 FIX: Validate webhook signature before processing
    // Use raw body for signature computation to avoid JSON re-serialization issues
    const rawBody = req.rawBody ? req.rawBody.toString() : undefined;
    const signaturePayload = rawBody || payload;

    if (
      !signature ||
      !this.whatsappProvider.validateWebhookSignature(
        signaturePayload,
        signature,
      )
    ) {
      throw new AppException(
        'UNAUTHORIZED',
        'Invalid or missing webhook signature.',
        401,
      );
    }

    return this.webhookService.handleFonnteIncomingMessage(payload);
  }
}
