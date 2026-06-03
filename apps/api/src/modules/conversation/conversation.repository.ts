import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GetConversationsQueryDto } from './dto/get-conversations.dto';

@Injectable()
export class ConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findConversations(tenantId: string, query: GetConversationsQueryDto) {
    const { state, aiMode, heatTier, search, cursor, limit = 20 } = query;

    const where: any = {
      tenantId,
      isArchived: false,
    };

    if (state) where.state = state;
    if (aiMode) where.aiMode = aiMode;

    if (heatTier) {
      where.lead = { heatTier };
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search } },
      ];
    }

    const conversations = await this.prisma.conversation.findMany({
      where,
      take: limit + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        customerPhone: true,
        customerName: true,
        state: true,
        aiMode: true,
        aiModePausedUntil: true,
        unreadCount: true,
        lastMessageAt: true,
        lastMessagePreview: true,
        lastSenderType: true,
        lead: {
          select: {
            heatTier: true,
            heatReasons: true,
          },
        },
        labelAssignments: {
          select: {
            label: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
        _count: {
          select: {
            followUps: {
              where: {
                status: 'PENDING',
                dueAt: {
                  lt: new Date(),
                },
              },
            },
          },
        },
      },
    });

    let hasNext = false;
    let nextCursor: string | null = null;

    if (conversations.length > limit) {
      hasNext = true;
      const nextItem = conversations.pop();
      if (nextItem) {
        nextCursor = conversations[conversations.length - 1].id;
      }
    }

    return {
      data: conversations,
      meta: {
        nextCursor,
        hasNext,
      },
    };
  }
}
