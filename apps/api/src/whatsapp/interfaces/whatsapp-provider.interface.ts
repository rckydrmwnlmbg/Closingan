export interface SendMessageOptions {
  to: string;
  message: string;
  tenantToken: string;
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

import { FonnteWebhookPayload } from './fonnte-webhook.interface';

export interface WhatsappProviderInterface {
  sendMessage(options: SendMessageOptions): Promise<SendMessageResult>;
  checkConnectionStatus(
    tenantToken: string,
    tenantId?: string,
  ): Promise<ConnectionStatusResult>;
  validateWebhookSignature(
    payload: FonnteWebhookPayload,
    signature: string,
    tenantId?: string,
  ): boolean;
}

export const WHATSAPP_PROVIDER = Symbol('WHATSAPP_PROVIDER');
