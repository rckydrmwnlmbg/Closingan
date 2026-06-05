export interface AiProviderInterface {
  generateReply(
    tenantId: string,
    prompt: string,
    systemContext?: string,
  ): Promise<{ reply: string; tokensUsed: number }>;
  analyzeLead(
    tenantId: string,
    conversation: string,
  ): Promise<{ result: any; tokensUsed: number }>;
  generateEmbedding(
    tenantId: string,
    text: string,
  ): Promise<{ embedding: number[]; tokensUsed: number }>;
}
