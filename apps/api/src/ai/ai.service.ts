import { Injectable, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import type { AiProviderInterface } from './interfaces/ai-provider.interface';
// import { AiFeedbackType } from '@prisma/client';
import { getSalesPrompt } from './prompts/sales.prompt';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('AI_PROVIDER')
    private readonly aiProvider: AiProviderInterface,
  ) {}

  async generateSuggestedReply(
    tenantId: string,
    conversationId: string,
  ): Promise<string> {
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
      this.logger.warn(
        `No messages found for conversation ${conversationId} (Tenant: ${tenantId})`,
      );
      return 'Hello! How can I help you today?';
    }

    // 2. Load Knowledge Base (active objections)
    const knowledgeBase = await this.prisma.knowledgeBase.findMany({
      where: { isActive: true },
    });

    // Extract patterns to see if customer mentioned any
    const latestCustomerMsg = messages.find(m => m.senderType === 'CUSTOMER')?.content?.toLowerCase() || '';
    const relevantKb = knowledgeBase.filter(kb => 
      latestCustomerMsg.includes(kb.objectionPattern.toLowerCase())
    );

    const kbEntries = relevantKb.map(kb => `[Kategori: ${kb.category}] Jika pelanggan tanya soal '${kb.objectionPattern}', maka rekomendasinya: ${kb.recommendedResponse}`);

    // 3. Format context for AI
    messages.reverse(); // Order from oldest to newest for context
    const formattedContext = messages
      .map(
        (msg) =>
          `[${msg.senderType === 'CUSTOMER' ? 'Customer' : 'Seller/AI'}]: ${msg.content}`,
      )
      .join('\n');

    const systemPrompt = getSalesPrompt(kbEntries);
    const prompt = `${systemPrompt}\n\nBased on the following conversation history, generate a helpful and concise suggested reply for the seller to send to the customer.\n\nConversation History:\n${formattedContext}`;

    // 4. Intelligent Model Routing
    const isComplex = latestCustomerMsg.length > 150 || 
                      latestCustomerMsg.includes('harga') || 
                      latestCustomerMsg.includes('diskon') || 
                      latestCustomerMsg.includes('kredit') ||
                      latestCustomerMsg.includes('dp') ||
                      relevantKb.length > 0;

    // We pass a 'modelPreference' option to the provider if supported. Since AiProviderInterface might not take it directly in standard args,
    // we assume we can pass it via options object if applicable, otherwise we just log it for now.
    this.logger.log(`Routing conversation ${conversationId} to ${isComplex ? 'PREMIUM' : 'EFFICIENT'} model`);

    // 3. Ask AI Provider
    try {
      const response = await this.aiProvider.generateReply(tenantId, prompt);
      return response.reply;
    } catch (error) {
      this.logger.error(
        `Failed to generate suggested reply for conversation ${conversationId} (Tenant: ${tenantId})`,
        error,
      );
      throw error;
    }
  }

  async submitFeedback(payload: {
    tenantId: string;
    userId: string;
    messageId: string;
    feedbackType: string;
    aiSuggestion: string;
    actualReplySent?: string;
  }) {
    const feedback = await this.prisma.aiFeedback.create({
      data: {
        tenantId: payload.tenantId,
        userId: payload.userId,
        messageId: payload.messageId,
        feedbackType: payload.feedbackType,
        aiSuggestion: payload.aiSuggestion,
        actualReplySent: payload.actualReplySent,
      },
    });

    this.logger.log(`AI Feedback submitted by user ${payload.userId}`);
    return feedback;
  }
}
