export interface FonnteWebhookPayload {
  device?: string;
  sender?: string;
  message?: string;
  text?: string;
  pesan?: string;
  name?: string;
  from?: string;
  id?: string;
  to?: string; // Target of outgoing message
  [key: string]: unknown; // Allow other properties
}
