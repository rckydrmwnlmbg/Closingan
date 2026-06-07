import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('whatsapp')
  @HttpCode(HttpStatus.OK)
  async handleFonnteWebhook(@Body() payload: any) {
    return this.webhookService.handleFonnteIncomingMessage(payload);
  }
}
