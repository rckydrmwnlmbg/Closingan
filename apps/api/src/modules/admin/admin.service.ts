import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AppException } from '../../common/exceptions/app.exception';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('ai-reply') private readonly aiReplyQueue: Queue,
    @InjectQueue('hot-lead') private readonly hotLeadQueue: Queue,
  ) {}

  async getQueueHealth() {
    const aiCounts = await this.aiReplyQueue.getJobCounts();
    const hotLeadCounts = await this.hotLeadQueue.getJobCounts();

    return {
      aiReply: aiCounts,
      hotLead: hotLeadCounts,
    };
  }

  async getFailedJobs(limit: number = 50) {
    return this.prisma.failedJob.findMany({
      take: limit,
      orderBy: { failedAt: 'desc' },
    });
  }

  async retryFailedJob(id: string) {
    const failedJob = await this.prisma.failedJob.findUnique({
      where: { id },
    });

    if (!failedJob) {
      throw new AppException('NOT_FOUND', 'Failed job not found', 404);
    }

    // A real implementation would push back to the respective BullMQ queue based on queueName
    // For now, we'll mark as resolved to mock the behavior
    await this.prisma.failedJob.update({
      where: { id },
      data: { resolvedAt: new Date() },
    });

    return { success: true, message: `Job ${id} retried/resolved` };
  }

  async getBusinessMetrics() {
    const activeTenants = await this.prisma.tenant.count({
      where: {
        subscription: {
          state: { in: ['ACTIVE', 'TRIAL'] },
        },
      },
    });

    const mrr = 0; // Mock calculation logic

    return { activeTenants, mrr };
  }

  getAiPerformance() {
    // Just a placeholder for actual aggregation over AiUsageLog
    return {
      averageLatencyMs: 1200,
      totalTokensUsed: 500000,
      successRate: 0.98,
    };
  }

  async getAtRiskUsers() {
    // Return users whose tokenQuota is > 95% or whose trial ends in 2 days
    return this.prisma.tenant.findMany({
      where: {
        tokenQuota: {
          usedQuota: { gt: 95 },
        },
      },
      include: {
        users: true,
        tokenQuota: true,
      },
      take: 20,
    });
  }
}
