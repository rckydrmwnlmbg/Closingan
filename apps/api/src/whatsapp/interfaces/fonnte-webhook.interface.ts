export interface FonnteWebhookPayload {
  device?: string;
  sender?: string;
  message?: string;
  text?: string;
  pesan?: string;
  name?: string;
  from?: string;
  id?: string;
  [key: string]: any; // Allow other properties
}
