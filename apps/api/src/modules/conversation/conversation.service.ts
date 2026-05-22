import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConversationRepository } from './conversation.repository';
import { GetConversationsQueryDto } from './dto/get-conversations.dto';
import { Conversation, Lead, ConversationLabelAssignment, ConversationLabel, FollowUp } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import type { AiProviderInterface } from '../../ai/interfaces/ai-provider.interface';
import { AppException } from '../../common/exceptions/app.exception';
import { AiSafetyException } from '../../ai/exceptions/ai-safety.exception';

type ConversationWithRelations = Conversation & {
  lead: Lead | null;
  labelAssignments: (ConversationLabelAssignment & { label: ConversationLabel })[];
  followUps: FollowUp[];
};

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    @Inject('AI_PROVIDER') private readonly aiProvider: AiProviderInterface,
  ) {}

  async getConversations(tenantId: string, query: GetConversationsQueryDto) {
    const { data, meta } = await this.conversationRepository.findConversations(tenantId, query);

    const formattedData = data.map((conv: ConversationWithRelations) => {
      // Map it to exactly API_CONTRACTS.md structure
      return {
        id: conv.id,
        customerPhone: conv.customerPhone,
        customerName: conv.customerName,
        state: conv.state,
        aiMode: conv.aiMode,
        aiModePausedUntil: conv.aiModePausedUntil,
        unreadCount: conv.unreadCount,
        lastMessageAt: conv.lastMessageAt?.toISOString() || null,
        lastMessagePreview: conv.lastMessagePreview,
        lastSenderType: conv.lastSenderType,
        heatTier: conv.lead?.heatTier || null,
        heatReasons: conv.lead?.heatReasons || [],
        hasOverdueFollowUp: conv.followUps?.length > 0,
      };
    });

    return { data: formattedData, meta };
  }

  async generateAiSuggestion(tenantId: string, conversationId: string) {
    const startTime = Date.now();
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new AppException('CONVERSATION_NOT_FOUND', 'Percakapan tidak ditemukan.', 404);
    }

    if (conversation.aiMode !== 'AI_ASSIST') {
      throw new AppException('INVALID_STATE', 'AI suggestion hanya tersedia di mode AI_ASSIST.', 400);
    }

    // Check quota
    const tokenQuota = await this.prisma.tokenQuota.findUnique({
      where: { tenantId },
    });

    if (tokenQuota && tokenQuota.usedQuota >= tokenQuota.totalQuota) {
      throw new AppException('AI_QUOTA_EXCEEDED', 'Kuota AI Anda telah habis.', 403);
    }

    // Get recent messages for context
    const recentMessages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const historyText = recentMessages
      .reverse()
      .map(m => `${m.senderType}: ${m.content}`)
      .join('\n');

    let suggestion: string;
    try {
      suggestion = await this.aiProvider.generateReply(tenantId, historyText);
    } catch (error) {
      if (error instanceof AiSafetyException) {
        throw new AppException('AI_SAFETY_BLOCKED', `Suggestion diblokir karena: ${error.reason}`, 400);
      }
      this.logger.error(`Failed to generate AI suggestion: ${error instanceof Error ? error.message : 'Unknown'}`);
      throw new AppException('INTERNAL_ERROR', 'Gagal menghasilkan AI suggestion', 500);
    }

    // Deduct quota
    if (tokenQuota) {
      await this.prisma.tokenQuota.update({
        where: { tenantId },
        data: { usedQuota: { increment: 1 } },
      });
    }

    await this.auditService.log({
      action: 'AI_MODE_CHANGED' as any,
      entityType: 'CONVERSATION',
      entityId: conversationId,
      metadata: {
        step: 'SUGGESTION_GENERATED',
        tokensUsed: 1,
      },
    });

    return {
      suggestion,
      model: 'gpt-4o-mini',
      latencyMs: Date.now() - startTime,
    };
  }
}
