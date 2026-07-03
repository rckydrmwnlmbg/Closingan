import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(tenantId: string) {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Set start of day for exact grouping
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // 1. Total messages sent/received over the last 7 days
    const messages = await this.prisma.message.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        senderType: true,
        createdAt: true,
      },
    });

    // Group messages by day
    const messagesByDay = messages.reduce(
      (acc, msg) => {
        const dateStr = msg.createdAt.toISOString().split('T')[0];
        if (!acc[dateStr]) {
          acc[dateStr] = { date: dateStr, sent: 0, received: 0 };
        }
        if (msg.senderType === 'SELLER' || msg.senderType === 'AI') {
          acc[dateStr].sent++;
        } else if (msg.senderType === 'CUSTOMER') {
          acc[dateStr].received++;
        }
        return acc;
      },
      {} as Record<string, { date: string; sent: number; received: number }>,
    );

    const messageTrend = Object.values(messagesByDay).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    // 2. Token consumption
    const aiUsageLogs = await this.prisma.aiUsageLog.aggregate({
      where: { tenantId },
      _sum: {
        promptTokens: true,
        completionTokens: true,
        totalTokens: true,
      },
    });

    const tokenQuota = await this.prisma.tokenQuota.findUnique({
      where: { tenantId },
    });

    const totalConversations = await this.prisma.conversation.count({
      where: { tenantId },
    });

    // 3. Summary of Active vs. Completed Campaigns
    const campaigns = await this.prisma.campaign.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: true,
    });

    const campaignSummary = campaigns.reduce(
      (acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      messageTrend,
      tokenUsage: {
        totalQuota: tokenQuota?.totalQuota || 0,
        usedQuota: tokenQuota?.usedQuota || 0,
        promptTokens: aiUsageLogs._sum.promptTokens || 0,
        completionTokens: aiUsageLogs._sum.completionTokens || 0,
        totalTokensConsumed: aiUsageLogs._sum.totalTokens || 0,
      },
      totalConversations,
      campaignSummary,
    };
  }

  async getSellerAnalytics(tenantId: string) {
    // Basic implementation to return response times or conversation status per seller
    // In a multi-user environment, we would filter by seller. For now we aggregate at tenant level.
    const conversations = await this.prisma.conversation.groupBy({
      by: ['state'],
      where: { tenantId },
      _count: true,
    });

    const followUps = await this.prisma.followUp.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: true,
    });

    const averageResponseTimeMs = 300000; // Mock 5 mins

    return {
      conversationStates: conversations,
      followUpStatus: followUps,
      averageResponseTimeMs,
    };
  }
}
