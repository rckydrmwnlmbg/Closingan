export interface FonnteWebhookPayload {
  device: string;
  sender: string;
  message: string;
  text?: string; // Sometimes text might be provided instead of message based on payload
  name?: string;
  from?: string; // Fallback for sender
  id?: string;
}
