import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ConnectionStatusResult, SendMessageOptions, SendMessageResult, WhatsappProviderInterface } from '../interfaces/whatsapp-provider.interface';
export declare class FonnteService implements WhatsappProviderInterface {
    private readonly httpService;
    private readonly configService;
    private readonly baseUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    sendMessage(options: SendMessageOptions): Promise<SendMessageResult>;
    checkConnectionStatus(tenantToken: string): Promise<ConnectionStatusResult>;
    validateWebhookSignature(_payload: any, _signature: string): boolean;
}
