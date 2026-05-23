import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout as rxTimeout, catchError, throwError, TimeoutError } from 'rxjs';
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

  private getMasterToken(): string {
    const token = this.configService.get<string>('FONNTE_SYSTEM_TOKEN');
    if (!token) {
      throw new InternalServerErrorException(
        'FONNTE_SYSTEM_TOKEN is not configured',
      );
    }
    return token;
  }

  async generateQrCode(
    tenantId: string,
  ): Promise<{ qrData: string; expiresAt: Date }> {
    try {
      // Create an endpoint call to Fonnte API to get a QR code
      // We pass the tenantId as a parameter or device to identify the tenant
      const response = await firstValueFrom(
        this.httpService.post<{
          status: boolean;
          url?: string;
          reason?: string;
        }>(
          `${this.baseUrl}/qr`,
          { type: 0 },
          {
            headers: {
              Authorization: this.getMasterToken(),
            },
          },
        ).pipe(
          rxTimeout(5000),
          catchError((err) => {
            if (err instanceof TimeoutError) {
              return throwError(() => new Error('Fonnte API timeout'));
            }
            return throwError(() => err);
          }),
        )
      );

      const data = response.data;
      if (data && data.status && data.url) {
        this.logger.log(`Generated QR code for Tenant: ${tenantId}`);
        // Fonnte returns URL or base64. Assuming `url` is returned.
        // We set expiration to 60 seconds from now
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + 60);

        return {
          qrData: data.url,
          expiresAt,
        };
      }

      this.logger.error(
        `Fonnte API failed to generate QR code for Tenant: ${tenantId} - Reason: ${data?.reason}`,
      );
      throw new InternalServerErrorException(
        'Failed to generate QR code via Fonnte',
      );
    } catch (error: unknown) {
      let errorMessage = 'Failed to generate QR code via Fonnte';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      this.logger.error(
        `Fonnte generate QR code failed for Tenant: ${tenantId} - Error: ${errorMessage}`,
      );
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async sendMessage(options: SendMessageOptions): Promise<SendMessageResult> {
    const { tenantId, to, message } = options;
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
              Authorization: this.getMasterToken(),
            },
          },
        ).pipe(
          rxTimeout(5000),
          catchError((err) => {
            if (err instanceof TimeoutError) {
              return throwError(() => new Error('Fonnte API timeout'));
            }
            return throwError(() => err);
          }),
        )
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
    tenantId?: string,
  ): Promise<ConnectionStatusResult> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<FonnteDeviceResponse>(
          `${this.baseUrl}/device`,
          {},
          {
            headers: {
              Authorization: this.getMasterToken(),
            },
          },
        ).pipe(
          rxTimeout(5000),
          catchError((err) => {
            if (err instanceof TimeoutError) {
              return throwError(() => new Error('Fonnte API timeout'));
            }
            return throwError(() => err);
          }),
        )
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
  ): boolean {
    const systemToken = this.configService.get<string>('FONNTE_SYSTEM_TOKEN');
    // For Fonnte platform-managed setup, webhook requests often send the exact system token back in the authorization header
    if (_signature === systemToken) {
      return true;
    }

    // We check for a specific Fonnte Webhook secret if configured separately
    const webhookSecret = this.configService.get<string>(
      'FONNTE_WEBHOOK_SECRET',
    );
    if (webhookSecret && _signature === webhookSecret) {
      return true;
    }

    this.logger.warn(
      `Invalid Fonnte Webhook Signature. Received: ${_signature}`,
    );
    return false;
  }
}
