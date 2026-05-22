import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  ConnectionStatusResult,
  SendMessageOptions,
  SendMessageResult,
  WhatsappProviderInterface,
} from '../interfaces/whatsapp-provider.interface';
import { FonnteWebhookPayload } from '../interfaces/fonnte-webhook.interface';

interface FonnteSendResponse {
  status: boolean;
  id?: string[];
  reason?: string;
}

interface FonnteDeviceResponse {
  status: boolean;
  device_status?: string;
  device?: string;
  name?: string;
}

@Injectable()
export class FonnteService implements WhatsappProviderInterface {
  private readonly baseUrl: string;
  private readonly logger = new Logger(FonnteService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const url = this.configService.get<string>('FONNTE_BASE_URL');
    if (!url) {
      throw new InternalServerErrorException(
        'FONNTE_BASE_URL is not configured',
      );
    }
    this.baseUrl = url;
  }

  async sendMessage(options: SendMessageOptions): Promise<SendMessageResult> {
    const { tenantId, to, message, tenantToken } = options;
    try {
      const response = await firstValueFrom(
        this.httpService.post<FonnteSendResponse>(
          `${this.baseUrl}/send`,
          {
            target: to,
            message: message,
          },
          {
            headers: {
              Authorization: tenantToken,
            },
          },
        ),
      );

      const data = response.data;
      if (data && data.status) {
        this.logger.log(
          `Message sent successfully for Tenant: ${tenantId || 'Unknown'}`,
        );
        return {
          success: true,
          messageId: data.id && data.id.length > 0 ? data.id[0] : undefined,
        };
      }

      this.logger.error(
        `Fonnte API returned false for Tenant: ${tenantId || 'Unknown'} - Reason: ${data?.reason}`,
      );
      return {
        success: false,
        error: data?.reason || 'Unknown Fonnte Error',
      };
    } catch (error: unknown) {
      let errorMessage = 'Failed to send message via Fonnte';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      this.logger.error(
        `Fonnte send message failed for Tenant: ${tenantId || 'Unknown'} - Error: ${errorMessage}`,
      );
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async checkConnectionStatus(
    tenantToken: string,
    tenantId?: string,
  ): Promise<ConnectionStatusResult> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<FonnteDeviceResponse>(
          `${this.baseUrl}/device`,
          {},
          {
            headers: {
              Authorization: tenantToken,
            },
          },
        ),
      );

      const data = response.data;
      if (data && data.status) {
        this.logger.log(
          `Connection status checked for Tenant: ${tenantId || 'Unknown'} - Status: ${data.device_status}`,
        );
        return {
          isConnected: data.device_status === 'connect',
          device: data.device,
          name: data.name,
        };
      }

      this.logger.warn(
        `Connection status false for Tenant: ${tenantId || 'Unknown'}`,
      );
      return {
        isConnected: false,
      };
    } catch (error) {
      this.logger.error(
        `Failed to check connection status for Tenant: ${tenantId || 'Unknown'}`,
      );
      return {
        isConnected: false,
      };
    }
  }

  validateWebhookSignature(
    _payload: FonnteWebhookPayload,
    _signature: string,
    tenantId?: string,
  ): boolean {
    // Implement validation logic based on Fonnte documentation if they use a signature
    // This often involves hashing payload or checking a secret token from headers
    // Dummy return for now
    this.logger.log(
      `Webhook signature validation called for Tenant: ${tenantId || 'Unknown'}`,
    );
    return true;
  }
}
