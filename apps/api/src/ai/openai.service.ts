import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AiProviderInterface } from './interfaces/ai-provider.interface';
import { AiSafetyService } from './ai-safety.service';

@Injectable()
export class OpenAiService implements AiProviderInterface {
  private readonly openai: OpenAI;
  private readonly logger = new Logger(OpenAiService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly aiSafetyService: AiSafetyService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException(
        'OPENAI_API_KEY is not configured',
      );
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async generateReply(tenantId: string, prompt: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Configurable or standard model
        messages: [{ role: 'user', content: prompt }],
      });

      const output = response.choices[0]?.message?.content || '';

      // HARD CONSTRAINT: AI Safety Wrapper.
      // Must pass through validation before returning to user.
      const isSafe = this.aiSafetyService.validateOutput(output);
      if (!isSafe) {
        throw new Error('AI Output failed safety validation');
      }

      this.logger.log(`AI Reply Generated for Tenant: ${tenantId}`);

      return output;
    } catch (error) {
      // HARD CONSTRAINT: Zero-Logging. Do not log the prompt or response content here.
      this.logger.error(
        `Failed to generate reply from OpenAI for Tenant: ${tenantId}`,
      );
      throw new InternalServerErrorException('Failed to generate AI reply');
    }
  }

  async analyzeLead(tenantId: string, conversation: string): Promise<any> {
    try {
      // Setup the instruction for the AI to analyze the conversation and output JSON.
      const systemInstruction = `You are an expert sales lead analyst. Analyze the following conversation and return a JSON object describing the lead's intent, status, and any extracted information.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: conversation },
        ],
        response_format: { type: 'json_object' },
      });

      const output = response.choices[0]?.message?.content || '{}';

      // HARD CONSTRAINT: AI Safety Wrapper.
      const isSafe = this.aiSafetyService.validateOutput(output);
      if (!isSafe) {
        throw new Error(
          'AI Output failed safety validation during lead analysis',
        );
      }

      this.logger.log(`Lead Analyzed for Tenant: ${tenantId}`);

      return JSON.parse(output);
    } catch (error) {
      // HARD CONSTRAINT: Zero-Logging. Do not log the conversation content.
      this.logger.error(
        `Failed to analyze lead from OpenAI for Tenant: ${tenantId}`,
      );
      throw new InternalServerErrorException('Failed to analyze lead');
    }
  }
}
