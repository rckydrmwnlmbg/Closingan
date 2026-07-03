export interface SendMessageOptions {
  to: string;
  message: string;
  tenantId?: string; // Add tenantId for better isolation context
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
  generateQrCode(
    tenantId: string,
  ): Promise<{ qrData: string; expiresAt: Date }>;
  sendMessage(options: SendMessageOptions): Promise<SendMessageResult>;
  checkConnectionStatus(tenantId?: string): Promise<ConnectionStatusResult>;
  validateWebhookSignature(payload: any, signature: string): boolean;
}

export const WHATSAPP_PROVIDER = Symbol('WHATSAPP_PROVIDER');
