import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class DashboardService implements OnModuleDestroy {
  private redisClient: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
    private readonly configService: ConfigService,
  ) {
    this.redisClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
    });
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }

  async getSummary(tenantId: string): Promise<Record<string, unknown>> {
    // Audit rule: Cache keys must be namespaced with tenantId to prevent leakage
    const cacheKey = `tenant:${tenantId}:dashboard:summary`;

    const cachedData = await this.redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData) as Record<string, unknown>;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const now = new Date();

    const [
      hotLeadsToday,
      pendingReply,
      oldestPendingConversation,
      followUpToday,
      followUpOverdue,
      waSession,
      criticalAlertsRaw,
      tokenQuota,
    ] = await Promise.all([
      // 1. Hot Leads Today
      this.prisma.lead.count({
        where: {
          tenantId,
          heatTier: { in: ['HOT', 'CRITICAL'] },
          heatUpdatedAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),

      // 2. Pending Reply Count
      this.prisma.conversation.count({
        where: {
          tenantId,
          state: 'WAITING_SELLER',
        },
      }),

      // 2. Longest Pending Reply
      this.prisma.conversation.findFirst({
        where: {
          tenantId,
          state: 'WAITING_SELLER',
        },
        orderBy: {
          lastMessageAt: 'asc',
        },
        select: {
          lastMessageAt: true,
        },
      }),

      // 3. Follow-up Today
      this.prisma.followUp.count({
        where: {
          tenantId,
          dueAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),

      // 3. Follow-up Overdue
      this.prisma.followUp.count({
        where: {
          tenantId,
          dueAt: {
            lt: now,
          },
          status: {
            notIn: ['COMPLETED', 'CANCELLED'],
          },
        },
      }),

      // 4. WhatsApp Status
      this.prisma.whatsappSession.findUnique({
        where: { tenantId },
        select: { state: true, phoneNumber: true },
      }),

      // 5. Critical Alerts
      this.prisma.escalationLog.findMany({
        where: {
          tenantId,
          resolvedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
        include: {
          conversation: {
            select: {
              customerName: true,
              customerPhone: true,
            },
          },
        },
      }),

      // 6. Token Quota
      this.prisma.tokenQuota.findUnique({
        where: { tenantId },
      }),
    ]);

    let longestPendingMinutes = 0;
    if (pendingReply > 0 && oldestPendingConversation?.lastMessageAt) {
      const diffMs =
        now.getTime() - oldestPendingConversation.lastMessageAt.getTime();
      longestPendingMinutes = Math.floor(diffMs / (1000 * 60));
    }

    const waStatus = {
      state: waSession?.state || 'DISCONNECTED',
      phoneNumber: waSession?.phoneNumber || null,
    };

    // Assuming AI is active if WA is connected. Since we don't have a global AI switch in Tenant,
    // we'll default to AI_ASSIST or read from user preferences if it existed.
    // Setting default to ACTIVE and AUTO_REPLY based on contracts, or check a representative conversation.
    const aiStatus = {
      isActive: waStatus.state === 'CONNECTED',
      mode: 'AUTO_REPLY',
    };

    const criticalAlerts = criticalAlertsRaw.map((alert) => ({
      type: 'ESCALATION_PENDING',
      message: `${alert.conversation.customerName || alert.conversation.customerPhone} ${this.formatEscalationReason(alert.reason)}`,
      conversationId: alert.conversationId,
    }));

    let quotaUsagePercent = 0;
    if (tokenQuota && tokenQuota.totalQuota > 0) {
      quotaUsagePercent = Math.round(
        (tokenQuota.usedQuota / tokenQuota.totalQuota) * 100,
      );
    }

    const summaryData = {
      hotLeadsToday,
      pendingReply,
      longestPendingMinutes,
      followUpToday,
      followUpOverdue,
      aiStatus,
      waStatus,
      criticalAlerts,
      quotaUsagePercent,
    };

    await this.redisClient.set(cacheKey, JSON.stringify(summaryData), 'EX', 30);

    return summaryData;
  }

  private formatEscalationReason(reason: string): string {
    const reasonMap: Record<string, string> = {
      CREDIT_SIMULATION_REQUEST: 'minta simulasi kredit',
      PRICE_NEGOTIATION: 'minta nego harga',
      SERIOUS_COMPLAINT: 'mengajukan komplain',
      AI_LOW_CONFIDENCE: 'membutuhkan bantuan manusia',
      UNKNOWN_INTENT: 'intent tidak diketahui',
      FINANCIAL_CLAIM_BLOCKED: 'klaim finansial diblokir',
      MANUAL_TRIGGER: 'meminta bicara dengan admin',
    };
    return reasonMap[reason] || 'perlu eskalasi';
  }
}
