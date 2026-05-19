export interface AiProviderInterface {
  generateReply(prompt: string): Promise<string>;
  analyzeLead(conversation: string): Promise<any>;
}
