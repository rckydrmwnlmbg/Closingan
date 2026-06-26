import { Injectable, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import type { AiProviderInterface } from './interfaces/ai-provider.interface';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('AI_PROVIDER')
    private readonly aiProvider: AiProviderInterface,
  ) {}

  async generateSuggestedReply(tenantId: string, conversationId: string): Promise<string> {
    // 1. Fetch conversation history with tenant isolation
    const messages = await this.prisma.message.findMany({
      where: {
        tenantId,
        conversationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Handle case where there are no messages
    if (messages.length === 0) {
       this.logger.warn(`No messages found for conversation ${conversationId} (Tenant: ${tenantId})`);
       return "Hello! How can I help you today?";
    }

    // 2. Format context for AI
    messages.reverse(); // Order from oldest to newest for context
    let formattedContext = messages
      .map(
        (msg) =>
          `[${msg.senderType === 'CUSTOMER' ? 'Customer' : 'Seller/AI'}]: ${msg.content}`,
      )
      .join('\n');

    const prompt = `Based on the following conversation history, generate a helpful and concise suggested reply for the seller to send to the customer.\n\nConversation History:\n${formattedContext}`;

    // 3. Ask AI Provider
    try {
      const response = await this.aiProvider.generateReply(
        tenantId,
        prompt,
      );
      return response.reply;
    } catch (error) {
      this.logger.error(`Failed to generate suggested reply for conversation ${conversationId} (Tenant: ${tenantId})`, error);
      throw error;
    }
  }
}
