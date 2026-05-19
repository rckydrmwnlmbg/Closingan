export interface SendMessageOptions {
    to: string;
    message: string;
    tenantToken: string;
}
export interface SendMessageResult {
    success: boolean;
    messageId?: string;
    error?: string;
}
export interface ConnectionStatusResult {
    isConnected: boolean;
    device?: string;
    name?: string;
}
export interface WhatsappProviderInterface {
    sendMessage(options: SendMessageOptions): Promise<SendMessageResult>;
    checkConnectionStatus(tenantToken: string): Promise<ConnectionStatusResult>;
    validateWebhookSignature(payload: any, signature: string): boolean;
}
export declare const WHATSAPP_PROVIDER: unique symbol;
