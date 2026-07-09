import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class ChurnService {
  private readonly logger = new Logger(ChurnService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Run nightly to detect at-risk users
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async detectChurnSignals() {
    this.logger.log('Running nightly churn signal detection...');
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const tenants = await this.prisma.tenant.findMany({
      select: { id: true, name: true }
    });

    const newSignals: any[] = [];

    for (const tenant of tenants) {
      // Check if already has an unresolved signal, skip if true (to prevent spam)
      const existingSignal = await this.prisma.churnSignal.findFirst({
        where: { tenantId: tenant.id, resolvedAt: null }
      });
      if (existingSignal) continue;

      let flagged = false;

      // 1. Login frequency turun > 50% dibanding minggu sebelumnya
      const loginsThisWeek = await this.prisma.auditLog.count({
        where: { tenantId: tenant.id, action: 'USER_LOGIN', createdAt: { gte: sevenDaysAgo } }
      });
      const loginsLastWeek = await this.prisma.auditLog.count({
        where: { tenantId: tenant.id, action: 'USER_LOGIN', createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } }
      });
      if (loginsLastWeek > 2 && loginsThisWeek < (loginsLastWeek * 0.5)) {
        const sig = await this.createSignal(tenant.id, 'LOGIN_DROP', `Logins dropped from ${loginsLastWeek} to ${loginsThisWeek}`);
        newSignals.push(sig);
        flagged = true;
      }

      if (flagged) continue;

      // 2. Tidak ada AI activity dalam 5 hari terakhir padahal sebelumnya aktif
      const aiMsgsBefore5Days = await this.prisma.message.count({
        where: { tenantId: tenant.id, senderType: 'AI', createdAt: { lt: fiveDaysAgo } }
      });
      const aiMsgsLast5Days = await this.prisma.message.count({
        where: { tenantId: tenant.id, senderType: 'AI', createdAt: { gte: fiveDaysAgo } }
      });
      if (aiMsgsBefore5Days > 5 && aiMsgsLast5Days === 0) {
        const sig = await this.createSignal(tenant.id, 'NO_AI_ACTIVITY', 'No AI messages in the last 5 days');
        newSignals.push(sig);
        flagged = true;
      }

      if (flagged) continue;

      // 3. Subscription renewal dalam 7 hari + tidak ada activity
      const subscription = await this.prisma.subscription.findFirst({
        where: { tenantId: tenant.id, state: 'ACTIVE' }
      });
      if (subscription && subscription.currentPeriodEnd && subscription.currentPeriodEnd <= inSevenDays && subscription.currentPeriodEnd >= now) {
        const recentConvs = await this.prisma.conversation.count({
          where: { tenantId: tenant.id, updatedAt: { gte: sevenDaysAgo } }
        });
        if (recentConvs === 0) {
          const sig = await this.createSignal(tenant.id, 'RENEWAL_AT_RISK', 'Renewal in < 7 days but no recent conversations');
          newSignals.push(sig);
          flagged = true;
        }
      }

      if (flagged) continue;

      // 4. Follow-up completion rate turun drastis
      const followupsDueThisWeek = await this.prisma.followUp.count({
        where: { tenantId: tenant.id, dueAt: { gte: sevenDaysAgo, lt: now } }
      });
      const followupsCompletedThisWeek = await this.prisma.followUp.count({
        where: { tenantId: tenant.id, status: 'COMPLETED', dueAt: { gte: sevenDaysAgo, lt: now } }
      });
      const followupsDueLastWeek = await this.prisma.followUp.count({
        where: { tenantId: tenant.id, dueAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } }
      });
      const followupsCompletedLastWeek = await this.prisma.followUp.count({
        where: { tenantId: tenant.id, status: 'COMPLETED', dueAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } }
      });

      const rateThisWeek = followupsDueThisWeek > 0 ? (followupsCompletedThisWeek / followupsDueThisWeek) : 0;
      const rateLastWeek = followupsDueLastWeek > 0 ? (followupsCompletedLastWeek / followupsDueLastWeek) : 0;

      if (followupsDueLastWeek > 5 && rateLastWeek > 0.5 && rateThisWeek < 0.2) {
         const sig = await this.createSignal(tenant.id, 'LOW_FOLLOWUP_RATE', `Follow-up completion rate dropped from ${Math.round(rateLastWeek*100)}% to ${Math.round(rateThisWeek*100)}%`);
         newSignals.push(sig);
         flagged = true;
      }

      if (flagged) continue;

      // 5. Fallback explicitly mentioned
      const recentActivity = await this.prisma.conversation.count({
        where: { tenantId: tenant.id, updatedAt: { gte: sevenDaysAgo } }
      });
      if (recentActivity === 0) {
         const sig = await this.createSignal(tenant.id, 'NO_CONVERSATION_7_DAYS', 'No conversation updates in 7 days');
         newSignals.push(sig);
      }
    }

    if (newSignals.length > 0) {
      await this.mailService.sendChurnSummary('founder@closingan.com', newSignals);
    }
  }

  private async createSignal(tenantId: string, type: any, notes: string) {
    const signal = await this.prisma.churnSignal.create({
      data: {
        tenantId,
        signalType: type,
        notes,
      }
    });
    this.logger.warn(`Flagged tenant ${tenantId} for churn risk: ${type}`);
    return signal;
  }

  async getActiveChurnSignals() {
    return this.prisma.churnSignal.findMany({
      where: { resolvedAt: null },
      include: { tenant: true }
    });
  }
  
  async getTenantChurnStatus(tenantId: string) {
    const signal = await this.prisma.churnSignal.findFirst({
      where: { tenantId, resolvedAt: null },
    });
    return signal;
  }

  async resolveSignal(tenantId: string) {
    await this.prisma.churnSignal.updateMany({
      where: { tenantId, resolvedAt: null },
      data: { 
        resolvedAt: new Date(), 
        interventionStatus: 'RECOVERED' 
      }
    });
  }

  /**
   * Run hourly to check if at-risk users have recovered (started logging in / sending messages again)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkRecoveredSignals() {
    this.logger.log('Checking for recovered churn signals...');
    const activeSignals = await this.getActiveChurnSignals();
    const now = new Date();

    for (const signal of activeSignals) {
      // Check if user has become active since the signal was created
      // Activity = logged in or sent a message
      const logins = await this.prisma.auditLog.count({
        where: { tenantId: signal.tenantId, action: 'USER_LOGIN', createdAt: { gte: signal.createdAt } }
      });
      
      const msgs = await this.prisma.message.count({
        where: { tenantId: signal.tenantId, senderType: 'SELLER', createdAt: { gte: signal.createdAt } }
      });

      if (logins > 0 || msgs > 0) {
        this.logger.log(`Tenant ${signal.tenantId} recovered from churn risk (Signal: ${signal.signalType})`);
        await this.resolveSignal(signal.tenantId);
      }
    }
  }
}
