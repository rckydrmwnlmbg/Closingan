import { FonnteWebhookPayload } from '../../whatsapp/interfaces/fonnte-webhook.interface';

export interface AiReplyJobData {
  tenantId: string;
  payload: FonnteWebhookPayload;
}

export interface HotLeadJobData {
  tenantId: string;
  leadId: string;
  conversationId: string;
  heatTier: string;
  heatReasons: string[];
}

export interface BlastJobData {
  tenantId: string;
  campaignId: string;
  recipientId: string;
}

export interface AiAnalysisJobData {
  tenantId: string;
  conversationId: string;
  messageContent: string;
}
