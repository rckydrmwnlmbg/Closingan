/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
import * as crypto from 'crypto';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConversationRepository } from './conversation.repository';
import { GetConversationsQueryDto } from './dto/get-conversations.dto';
import {
  Conversation,
  ConversationState,
  AiMode,
  SenderType,
  HeatTier,
} from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import type { AiProviderInterface } from '../../ai/interfaces/ai-provider.interface';
import { WHATSAPP_PROVIDER } from '../../whatsapp/interfaces/whatsapp-provider.interface';
import type { WhatsappProviderInterface } from '../../whatsapp/interfaces/whatsapp-provider.interface';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../common/redis/redis.service';
import { AppException } from '../../common/exceptions/app.exception';
import { AiSafetyException } from '../../ai/exceptions/ai-safety.exception';

type ConversationWithRelations = Partial<Conversation> & {
  id: string;
  customerPhone: string;
  customerName: string | null;
  state: ConversationState;
  aiMode: AiMode;
  aiModePausedUntil: Date | null;
  unreadCount: number;
  lastMessageAt: Date | null;
  lastMessagePreview: string | null;
  lastSenderType: SenderType;
  lead?: { heatTier: HeatTier; heatReasons: string[] } | null;
  _count?: { followUps: number };
};

@Injectable()
export class ConversationService {
  async sendMessageManual(
    tenantId: string,
    conversationId: string,
    content: string,
  ) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId },
    });

    if (!conversation) {
      throw new AppException(
        'CONVERSATION_NOT_FOUND',
        'Percakapan tidak ditemukan.',
        404,
      );
    }

    // Determine Human Takeover Cooldown
    const cooldownMinutes =
      this.configService.get<number>('HUMAN_TAKEOVER_COOLDOWN_MINUTES') || 15;
    const pausedUntil = new Date(Date.now() + cooldownMinutes * 60000);

    const isAiActive =
      conversation.aiMode === 'AI_ASSIST' ||
      conversation.aiMode === 'SMART_HYBRID' ||
      conversation.aiMode === 'AUTO_REPLY';

    // 1. Set HUMAN_ACTIVE state and pause AI
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        state: isAiActive ? 'HUMAN_ACTIVE' : conversation.state,
        aiModePausedUntil: isAiActive
          ? pausedUntil
          : conversation.aiModePausedUntil,
        lastMessageAt: new Date(),
        lastMessagePreview: content.substring(0, 100),
        lastSenderType: 'SELLER',
      },
    });

    // 2. Log Audit & Redis caching
    if (isAiActive) {
      // SET Redis key to quickly intercept webhook looping without hitting DB
      const takeoverKey = `tenant:${tenantId}:customerPhone:${conversation.customerPhone}:takeover`;
      await this.redisService.set(takeoverKey, '1', cooldownMinutes * 60);

      await this.auditService.log({
        tenantId,
        action: 'AI_MODE_CHANGED', // Using existing enum
        entityType: 'CONVERSATION',
        entityId: conversationId,
        metadata: {
          step: 'HUMAN_TAKEOVER',
          cooldownMinutes,
          pausedUntil,
        },
      });
    }

    // Invalidate conversation cache
    await this.redisService.delPattern(`conversations:${tenantId}:*`);

    // 3. Save Message to Database
    const message = await this.prisma.message.create({
      data: {
        tenantId,
        conversationId,
        senderType: 'SELLER',
        content,
        deliveryState: 'SENT',
        isAiGenerated: false,
      },
    });

    // 4. Send via WhatsApp Provider
    try {
      const sendResult = await this.whatsappProvider.sendMessage({
        tenantId,
        to: conversation.customerPhone,
        message: content,
      });

      if (!sendResult.success) {
        throw new AppException(
          'WA_SEND_FAILED',
          `Failed to send message: ${sendResult.error}`,
          500,
        );
      }
    } catch (error) {
      // Revert message delivery state if sending failed
      await this.prisma.message.update({
        where: { id: message.id },
        data: { deliveryState: 'FAILED' },
      });
      throw error;
    }

    return message;
  }

  private readonly logger = new Logger(ConversationService.name);

  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    @Inject('AI_PROVIDER') private readonly aiProvider: AiProviderInterface,
    @Inject(WHATSAPP_PROVIDER)
    private readonly whatsappProvider: WhatsappProviderInterface,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async getConversations(tenantId: string, query: GetConversationsQueryDto) {
    const paramsHash = crypto
      .createHash('md5')
      .update(JSON.stringify(query))
      .digest('hex');
    const cacheKey = `conversations:${tenantId}:${paramsHash}`;

    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const { data, meta } = await this.conversationRepository.findConversations(
      tenantId,
      query,
    );

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
        hasOverdueFollowUp: (conv._count?.followUps || 0) > 0,
      };
    });

    const result = { data: formattedData, meta };
    await this.redisService.set(cacheKey, JSON.stringify(result), 10);
    return result as any;
  }

  async getMessagesByPhone(
    tenantId: string,
    customerPhone: string,
    cursor?: string,
    limit = 30,
  ) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { tenantId, customerPhone },
      select: { id: true },
    });

    if (!conversation) {
      throw new AppException(
        'CONVERSATION_NOT_FOUND',
        'Percakapan tidak ditemukan.',
        404,
      );
    }

    return this.getMessages(tenantId, conversation.id, cursor, limit);
  }

  async getMessages(
    tenantId: string,
    conversationId: string,
    cursor?: string,
    limit = 30,
  ) {
    const messages = await this.prisma.message.findMany({
      where: { tenantId, conversationId },
      take: limit + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      orderBy: { createdAt: 'desc' }, // Usually want newest first, but based on docs might need asc. Docs show one result. Let's use desc for cursor pagination.
      select: {
        id: true,
        senderType: true,
        senderName: true,
        content: true,
        deliveryState: true,
        isAiGenerated: true,
        aiMode: true,
        createdAt: true,
      },
    });

    let hasNext = false;
    let nextCursor: string | null = null;

    if (messages.length > limit) {
      hasNext = true;
      const nextItem = messages.pop();
      if (nextItem) {
        nextCursor = messages[messages.length - 1].id;
      }
    }

    return {
      data: messages,
      meta: {
        nextCursor,
        hasNext,
      },
    };
  }

  async generateAiSuggestion(tenantId: string, conversationId: string) {
    const startTime = Date.now();
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId },
    });

    if (!conversation) {
      throw new AppException(
        'CONVERSATION_NOT_FOUND',
        'Percakapan tidak ditemukan.',
        404,
      );
    }

    if (conversation.aiMode !== 'AI_ASSIST') {
      throw new AppException(
        'INVALID_STATE',
        'AI suggestion hanya tersedia di mode AI_ASSIST.',
        400,
      );
    }

    // Check quota
    const tokenQuota = await this.prisma.tokenQuota.findUnique({
      where: { tenantId },
    });

    if (tokenQuota && tokenQuota.usedQuota >= tokenQuota.totalQuota) {
      throw new AppException(
        'AI_QUOTA_EXCEEDED',
        'Kuota AI Anda telah habis.',
        403,
      );
    }

    // Get recent messages for context
    const recentMessages = await this.prisma.message.findMany({
      where: { conversationId, tenantId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const historyText = recentMessages
      .reverse()
      .map((m) => `${m.senderType}: ${m.content}`)
      .join('\n');

    let suggestion: string;
    let tokensUsed = 0;
    try {
      const response = await this.aiProvider.generateReply(
        tenantId,
        historyText,
      );
      suggestion = response.reply;
      tokensUsed = response.tokensUsed;
    } catch (error) {
      if (error instanceof AiSafetyException) {
        throw new AppException(
          'AI_SAFETY_BLOCKED',
          `Suggestion diblokir karena: ${error.reason}`,
          400,
        );
      }
      this.logger.error(
        `Failed to generate AI suggestion: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
      throw new AppException(
        'INTERNAL_ERROR',
        'Gagal menghasilkan AI suggestion',
        500,
      );
    }

    // Deduct actual quota
    if (tokenQuota && tokensUsed > 0) {
      await this.prisma.tokenQuota.update({
        where: { tenantId },
        data: { usedQuota: { increment: tokensUsed } },
      });
    }

    await this.auditService.log({
      action: 'AI_MODE_CHANGED',
      entityType: 'CONVERSATION',
      entityId: conversationId,
      metadata: {
        step: 'SUGGESTION_GENERATED',
        tokensUsed: tokensUsed,
      },
    });

    return {
      suggestion,
      model: 'gpt-4o-mini',
      latencyMs: Date.now() - startTime,
    };
  }

  async getConversation(tenantId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId },
      include: { lead: true },
    });

    if (!conversation) {
      throw new AppException('NOT_FOUND', 'Conversation not found', 404);
    }
    return conversation;
  }

  async updateAiMode(tenantId: string, conversationId: string, aiMode: AiMode) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId },
    });

    if (!conversation) {
      throw new AppException('NOT_FOUND', 'Conversation not found', 404);
    }

    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { aiMode },
    });
  }

  async archiveConversation(tenantId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId },
    });

    if (!conversation) {
      throw new AppException('NOT_FOUND', 'Conversation not found', 404);
    }

    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { state: 'ARCHIVED' },
    });
  }
}
