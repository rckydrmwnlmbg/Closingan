import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import type { Request } from 'express';
import { FonnteWebhookPayloadDto } from '../whatsapp/interfaces/fonnte-webhook.dto';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('fonnte')
  @HttpCode(HttpStatus.OK)
  async handleFonnteWebhook(
    @Body() payload: FonnteWebhookPayloadDto,
    @Headers('authorization') signature: string,
    @Query('tenantId') tenantId: string,
    @Req() request: Request,
  ) {
    return this.webhookService.handleFonnteIncomingMessage(
      payload,
      signature,
      tenantId,
    );
  }
}
