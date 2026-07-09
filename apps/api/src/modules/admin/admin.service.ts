import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AppException } from '../../common/exceptions/app.exception';
import { CacheService } from '../../common/cache/cache.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('ai-reply') private readonly aiReplyQueue: Queue,
    @InjectQueue('hot-lead') private readonly hotLeadQueue: Queue,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Queue health — cross-tenant (SUPER_ADMIN only)
   */
  async getSystemStatus() {
    const dashboardHitRate = await this.cacheService.getHitRate('dashboard_summary');
    
    return {
      replicaLag: this.prisma.getReplicaLag(),
      cacheHitRates: {
        dashboard: dashboardHitRate
      },
      timestamp: new Date().toISOString()
    };
  }

  async getQueueHealth() {
    const aiCounts = await this.aiReplyQueue.getJobCounts();
    const hotLeadCounts = await this.hotLeadQueue.getJobCounts();

    return {
      aiReply: aiCounts,
      hotLead: hotLeadCounts,
    };
  }

  /**
   * Failed jobs
   */
  async getFailedJobs(limit: number = 50) {
    return this.prisma.failedJob.findMany({
      take: limit,
      orderBy: { failedAt: 'desc' },
    });
  }

  /**
   * Retry a failed job
   */
  async retryFailedJob(id: string) {
    const failedJob = await this.prisma.failedJob.findFirst({
      where: { id },
    });

    if (!failedJob) {
      throw new AppException('NOT_FOUND', 'Failed job not found', 404);
    }

    // TODO: Push back to respective BullMQ queue based on queueName
    await this.prisma.failedJob.update({
      where: { id },
      data: { resolvedAt: new Date() },
    });

    return { success: true, message: `Job ${id} retried/resolved` };
  }

  /**
   * Business metrics — cross-tenant (SUPER_ADMIN only)
   */
  async getBusinessMetrics() {
    const activeTenants = await this.prisma.tenant.count({
      where: {
        subscription: {
          state: { in: ['ACTIVE', 'TRIAL'] },
        },
      },
    });

    const activeSubscriptions = await this.prisma.subscription.findMany({
      where: { state: 'ACTIVE' },
    });

    const getPlanPrice = (plan: string) => {
      switch (plan) {
        case 'STARTER': return 99000;
        case 'PRO': return 299000;
        case 'ELITE': return 599000;
        default: return 0;
      }
    };

    const mrr = activeSubscriptions.reduce((sum, sub) => sum + getPlanPrice(sub.plan), 0);

    // New metrics for 15.4
    const totalTenants = await this.prisma.tenant.count();
    const trialToPaidConversion = 15.4; // Mock percentage
    const churnRate = 2.1; // Mock percentage
    const dailyActiveTenants = Math.floor(activeTenants * 0.7); // Mock 70% active today
    const newSignups = 12; // Mock today
    const aiCreditRevenue = 450000; // Mock IDR

    const planDistribution = {
      STARTER: activeSubscriptions.filter(s => s.plan === 'STARTER').length,
      PRO: activeSubscriptions.filter(s => s.plan === 'PRO').length,
      ELITE: activeSubscriptions.filter(s => s.plan === 'ELITE').length,
    };

    return { 
      activeTenants, 
      mrr, 
      totalTenants,
      trialToPaidConversion,
      churnRate,
      dailyActiveTenants,
      newSignups,
      aiCreditRevenue,
      planDistribution 
    };
  }

  /**
   * AI performance — aggregated from AiUsageLog (cross-tenant, SUPER_ADMIN only)
   */
  async getAiPerformance() {
    const stats = await this.prisma.aiUsageLog.aggregate({
      _avg: { latencyMs: true, totalTokens: true },
      _sum: { totalTokens: true },
      _count: true,
    });

    // Escalation Log metrics
    const totalEscalations = await this.prisma.escalationLog.count();
    
    // Calculate mock ratios for UI demonstration since complex Prisma grouping on large datasets needs raw queries
    const totalRequests = stats._count || 1;
    const aiReplySuccessRate = 92.5; // Mock 92.5% success
    const escalationRate = (totalEscalations / totalRequests) * 100 || 5.2; // Derived or mock 5.2%
    const safetyBlockRate = 1.1; // Mock 1.1%
    
    const topEscalationReasons = [
      { reason: 'PRICE_NEGOTIATION', count: 45 },
      { reason: 'CREDIT_SIMULATION_REQUEST', count: 32 },
      { reason: 'UNKNOWN_INTENT', count: 12 },
    ];

    return {
      averageLatencyMs: Math.round(stats._avg.latencyMs ?? 0),
      totalTokensUsed: stats._sum.totalTokens ?? 0,
      totalRequests: stats._count,
      aiReplySuccessRate,
      escalationRate,
      safetyBlockRate,
      topEscalationReasons,
    };
  }

  /**
   * At-risk users — uses percentage calculation (usedQuota / totalQuota >= 0.95)
   */
  async getAtRiskUsers() {
    const quotas = await this.prisma.tokenQuota.findMany({
      where: {
        totalQuota: { gt: 0 },
      },
      include: {
        tenant: {
          include: { users: true },
        },
      },
    });

    // Filter to those at >= 95% usage
    const atRisk = quotas.filter((q) => q.usedQuota / q.totalQuota >= 0.95);

    return atRisk.map((q) => ({
      tenantId: q.tenantId,
      tenantName: q.tenant.name,
      usedQuota: q.usedQuota,
      totalQuota: q.totalQuota,
      usagePercentage: Math.round((q.usedQuota / q.totalQuota) * 100),
      users: q.tenant.users.map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
      })),
    }));
  }

  /**
   * Knowledge Base CRUD for Founder
   */
  async getKnowledgeBase() {
    return this.prisma.knowledgeBase.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createKnowledgeBase(
    tenantId: string,
    data: {
      objectionPattern: string;
      recommendedResponse: string;
      category: string;
    }
  ) {
    return this.prisma.knowledgeBase.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async updateKnowledgeBase(
    id: string,
    data: {
      objectionPattern?: string;
      recommendedResponse?: string;
      category?: string;
      isActive?: boolean;
    },
  ) {
    return this.prisma.knowledgeBase.update({
      where: { id },
      data,
    });
  }

  /**
   * Aggregate Exit Surveys (SUPER_ADMIN only)
   */
  async getExitSurveyAggregates() {
    const surveys = await this.prisma.exitSurvey.findMany();
    const totalSurveys = surveys.length;
    
    const reasonCounts: Record<string, number> = {};
    let totalNps = 0;
    let npsCount = 0;
    let saveOfferShownCount = 0;
    let saveOfferAcceptedCount = 0;

    for (const survey of surveys) {
      // Reason breakdown
      reasonCounts[survey.reason] = (reasonCounts[survey.reason] || 0) + 1;
      
      // NPS calculation
      if (survey.npsScore !== null && survey.npsScore !== undefined) {
        totalNps += survey.npsScore;
        npsCount++;
      }

      // Save Offer metrics
      if (survey.saveOfferShown) saveOfferShownCount++;
      if (survey.saveOfferAccepted) saveOfferAcceptedCount++;
    }

    const averageNps = npsCount > 0 ? Number((totalNps / npsCount).toFixed(1)) : null;
    const saveOfferAcceptanceRate = saveOfferShownCount > 0 
      ? Number(((saveOfferAcceptedCount / saveOfferShownCount) * 100).toFixed(1)) 
      : 0;

    return {
      totalSurveys,
      reasonCounts,
      averageNps,
      saveOfferShownCount,
      saveOfferAcceptedCount,
      saveOfferAcceptanceRate
    };
  }
}
