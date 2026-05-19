import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  ConnectionStatusResult,
  SendMessageOptions,
  SendMessageResult,
  WhatsappProviderInterface,
} from '../interfaces/whatsapp-provider.interface';

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

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const url = this.configService.get<string>('FONNTE_API_URL');
    if (!url) {
      throw new InternalServerErrorException(
        'FONNTE_API_URL is not configured',
      );
    }
    this.baseUrl = url;
  }

  async sendMessage(options: SendMessageOptions): Promise<SendMessageResult> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<FonnteSendResponse>(
          `${this.baseUrl}/send`,
          {
            target: options.to,
            message: options.message,
          },
          {
            headers: {
              Authorization: options.tenantToken,
            },
          },
        ),
      );

      const data = response.data;
      if (data && data.status) {
        return {
          success: true,
          messageId: data.id && data.id.length > 0 ? data.id[0] : undefined,
        };
      }

      return {
        success: false,
        error: data?.reason || 'Unknown Fonnte Error',
      };
    } catch (error: unknown) {
      let errorMessage = 'Failed to send message via Fonnte';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async checkConnectionStatus(
    tenantToken: string,
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
        return {
          isConnected: data.device_status === 'connect',
          device: data.device,
          name: data.name,
        };
      }

      return {
        isConnected: false,
      };
    } catch {
      return {
        isConnected: false,
      };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validateWebhookSignature(_payload: any, _signature: string): boolean {
    // Implement validation logic based on Fonnte documentation if they use a signature
    // This often involves hashing payload or checking a secret token from headers
    // Dummy return for now
    return true;
  }
}
