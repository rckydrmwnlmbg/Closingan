export interface AiProviderInterface {
    generateReply(tenantId: string, prompt: string): Promise<string>;
    analyzeLead(tenantId: string, conversation: string): Promise<any>;
}
