export interface AiProviderInterface {
  generateReply(
    tenantId: string,
    prompt: string,
  ): Promise<{ reply: string; tokensUsed: number }>;
  analyzeLead(
    tenantId: string,
    conversation: string,
  ): Promise<{ result: any; tokensUsed: number }>;
}
