import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Headers,
  Req,
  Inject,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { WebhookService } from './webhook.service';
import { WHATSAPP_PROVIDER } from '../whatsapp/interfaces/whatsapp-provider.interface';
import type { WhatsappProviderInterface } from '../whatsapp/interfaces/whatsapp-provider.interface';
import { AppException } from '../common/exceptions/app.exception';
import { FonnteWebhookPayloadDto } from '../whatsapp/interfaces/fonnte-webhook.dto';
import type { Request } from 'express';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    @Inject(WHATSAPP_PROVIDER)
    private readonly whatsappProvider: WhatsappProviderInterface,
  ) {}

  @Post('fonnte')
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // Allow 100 requests per minute per IP for Webhook
  @HttpCode(HttpStatus.OK)
  async handleFonnteWebhook(
    @Body() payload: FonnteWebhookPayloadDto,
    @Headers('x-fonnte-signature') signature: string,
    @Req() req: Request & { rawBody?: Buffer },
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
