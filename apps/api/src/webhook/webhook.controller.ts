import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { FonnteWebhookPayloadDto } from '../whatsapp/interfaces/fonnte-webhook.dto';
import { MetaSignatureGuard } from '../common/guards/meta-signature.guard';

@Controller('webhook')
@UseGuards(MetaSignatureGuard)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('whatsapp')
  @HttpCode(HttpStatus.OK)
  async handleFonnteWebhook(
    @Body() payload: FonnteWebhookPayloadDto,
    @Headers('authorization') signature: string,
  ) {
    return this.webhookService.handleFonnteIncomingMessage(payload, signature);
  }
}
