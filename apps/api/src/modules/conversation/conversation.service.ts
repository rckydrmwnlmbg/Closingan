import { Injectable } from '@nestjs/common';
import { ConversationRepository } from './conversation.repository';
import { GetConversationsQueryDto } from './dto/get-conversations.dto';
import { Conversation, Lead, ConversationLabelAssignment, ConversationLabel, FollowUp } from '@prisma/client';

type ConversationWithRelations = Conversation & {
  lead: Lead | null;
  labelAssignments: (ConversationLabelAssignment & { label: ConversationLabel })[];
  followUps: FollowUp[];
};

@Injectable()
export class ConversationService {
  constructor(private readonly conversationRepository: ConversationRepository) {}

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
}
