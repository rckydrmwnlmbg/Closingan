import { ConfigService } from '@nestjs/config';
import { AiProviderInterface } from './interfaces/ai-provider.interface';
import { AiSafetyService } from './ai-safety.service';
export declare class OpenAiService implements AiProviderInterface {
    private readonly configService;
    private readonly aiSafetyService;
    private readonly openai;
    private readonly logger;
    constructor(configService: ConfigService, aiSafetyService: AiSafetyService);
    generateReply(tenantId: string, prompt: string): Promise<string>;
    analyzeLead(tenantId: string, conversation: string): Promise<any>;
}
