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

export const WHATSAPP_PROVIDER = Symbol('WHATSAPP_PROVIDER');
