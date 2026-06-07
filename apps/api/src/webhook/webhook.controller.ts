import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { FonnteWebhookPayloadDto } from '../whatsapp/interfaces/fonnte-webhook.dto';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('whatsapp')
  @HttpCode(HttpStatus.OK)
  async handleFonnteWebhook(@Body() payload: FonnteWebhookPayloadDto) {
    return this.webhookService.handleFonnteIncomingMessage(payload);
  }
}
