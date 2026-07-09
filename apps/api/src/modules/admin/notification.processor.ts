import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../common/prisma/prisma.service';
import { WHATSAPP_PROVIDER } from '../../whatsapp/interfaces/whatsapp-provider.interface';
import type { WhatsappProviderInterface } from '../../whatsapp/interfaces/whatsapp-provider.interface';
import { ConfigService } from '@nestjs/config';

@Processor('notification')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(WHATSAPP_PROVIDER)
    private readonly waProvider: WhatsappProviderInterface,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { type, tenantId, message } = job.data;
    
    if (type === 'DAILY_DIGEST') {
      await this.sendDailyDigest(tenantId);
    } else if (type === 'WEEKLY_SUMMARY') {
      await this.sendWeeklySummary(tenantId);
    } else if (type === 'IDLE_ALERT') {
      await this.sendIdleAlert(tenantId);
    } else if (type === 'ACHIEVEMENT_ALERT') {
      await this.sendAchievementAlert(tenantId);
    } else {
      this.logger.log(`Sending general notification to tenant ${tenantId}: ${message}`);
      await this.broadcastToTenantUsers(tenantId, message);
    }
  }

  private async broadcastToTenantUsers(tenantId: string, message: string) {
    const users = await this.prisma.user.findMany({
      where: {
        tenantId,
        waPersonalNumber: { not: null },
      },
      select: { waPersonalNumber: true, fullName: true },
    });

    for (const user of users) {
      if (user.waPersonalNumber) {
        try {
          await this.waProvider.sendMessage({
            to: user.waPersonalNumber,
            message,
            tenantId,
          });
        } catch (error) {
          this.logger.error(`Failed to send notification to ${user.waPersonalNumber}`, error);
        }
      }
    }
  }

  private async sendDailyDigest(tenantId: string) {
    this.logger.log(`Generating daily digest for tenant ${tenantId}`);
    
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // 1. Get hot leads from DB (priority or heatTier)
    const hotLeads = await this.prisma.conversation.count({
      where: { tenantId, state: 'OPEN', lead: { heatTier: 'HOT' } },
    });

    // 2. Count follow-ups due today
    const followUpsToday = await this.prisma.followUp.count({
      where: {
        tenantId,
        status: 'PENDING',
        dueAt: {
          gte: startOfToday,
          lt: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    // 3. Count pending replies (WAITING_SELLER before today)
    const pendingReplies = await this.prisma.conversation.count({
      where: {
        tenantId,
        state: 'WAITING_SELLER',
        updatedAt: { lt: startOfToday },
      },
    });
    
    const digestMessage = `*Daily Digest CLOSINGAN*\n\nHalo! Berikut ringkasan hari ini:\n🔥 ${hotLeads} Hot Lead aktif\n📅 ${followUpsToday} Follow-up terjadwal hari ini\n⏳ ${pendingReplies} Pesan menunggu balasan (pending dari kemarin)\n\nSemangat closing hari ini! 🚀`;
    
    await this.broadcastToTenantUsers(tenantId, digestMessage);
    this.logger.log(`Daily digest sent for tenant ${tenantId}`);
  }

  private async sendWeeklySummary(tenantId: string) {
    this.logger.log(`Generating weekly summary for tenant ${tenantId}`);
    
    const now = new Date();
    const startOfThisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1); // Monday
    const startOfLastWeek = new Date(startOfThisWeek.getTime() - 7 * 24 * 60 * 60 * 1000);

    const leadsThisWeek = await this.prisma.conversation.count({
      where: { tenantId, createdAt: { gte: startOfThisWeek } },
    });

    const leadsLastWeek = await this.prisma.conversation.count({
      where: { tenantId, createdAt: { gte: startOfLastWeek, lt: startOfThisWeek } },
    });

    const diff = leadsThisWeek - leadsLastWeek;
    const trendStr = diff >= 0 ? `naik +${diff}` : `turun ${Math.abs(diff)}`;

    const message = `*Weekly Summary CLOSINGAN*\n\nStatistik minggu ini:\n📈 Total Lead Baru: ${leadsThisWeek} (${trendStr} dibanding minggu lalu)\n\nTetap semangat follow-up lead-nya! 💪`;

    await this.broadcastToTenantUsers(tenantId, message);
  }

  private async sendIdleAlert(tenantId: string) {
    this.logger.log(`Checking idle users for tenant ${tenantId}`);
    
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    const idleUsers = await this.prisma.user.findMany({
      where: {
        tenantId,
        lastLoginAt: { lt: threeDaysAgo },
        waPersonalNumber: { not: null },
      },
    });

    if (idleUsers.length === 0) return;

    const unhandledLeads = await this.prisma.conversation.count({
      where: { tenantId, state: 'WAITING_SELLER' },
    });

    for (const user of idleUsers) {
      if (user.waPersonalNumber) {
        const message = `*Halo ${user.fullName || 'Kak'}!*\n\nKamu sudah tidak login selama lebih dari 3 hari. Saat ini ada *${unhandledLeads} lead* yang belum direspons lho.\nYuk login dan sapa mereka sekarang, siapa tahu hari ini closing! 🎯`;
        
        try {
          await this.waProvider.sendMessage({
            to: user.waPersonalNumber,
            message,
            tenantId,
          });
        } catch (error) {
          this.logger.error(`Failed to send idle alert to ${user.waPersonalNumber}`, error);
        }
      }
    }
  }

  private async sendAchievementAlert(tenantId: string) {
    this.logger.log(`Checking achievements for tenant ${tenantId}`);
    
    const now = new Date();
    // Get users with waPersonalNumber
    const users = await this.prisma.user.findMany({
      where: {
        tenantId,
        waPersonalNumber: { not: null },
      },
    });

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const badgeName = `50_LEADS_${now.getFullYear()}_${now.getMonth() + 1}`;

    for (const user of users) {
      if (!user.waPersonalNumber) continue;

      // Check if user already got the badge this month
      const existingBadge = await this.prisma.userBadge.findUnique({
        where: {
          userId_badge: {
            userId: user.id,
            badge: badgeName,
          }
        }
      });

      if (existingBadge) continue;

      // Check if user replied to 50 leads this month
      // We count unique conversations where the user sent a message this month
      // However, Prisma doesn't easily support count distinct.
      // So we fetch the distinct conversation IDs where senderName or some criteria matches the user.
      // Assuming seller's messages are recorded with senderType 'SELLER' and we can link to user via externalId or just count messages.
      // Let's simplify: 50 messages sent by SELLER in this tenant this month.
      // Wait, is there a direct link between Message and User? No, Message only has senderName.
      // If we assume a small tenant, we can just check if total SELLER messages > 50?
      // No, it's a personal achievement. But since we don't track which user sent which message explicitly in `Message` (only senderType = SELLER and senderName),
      // we can check if `senderName` matches `user.fullName` or just use total SELLER messages if it's a single-user tenant.
      // Let's match by `senderName = user.fullName`.
      if (!user.fullName) continue;

      const userMessages = await this.prisma.message.findMany({
        where: {
          tenantId,
          senderType: 'SELLER',
          senderName: user.fullName,
          createdAt: { gte: startOfMonth },
        },
        select: { conversationId: true },
        distinct: ['conversationId'],
      });

      if (userMessages.length >= 50) {
        // Grant badge
        await this.prisma.userBadge.create({
          data: {
            userId: user.id,
            badge: badgeName,
          }
        });

        // Send notification
        const message = `*Achievement Unlocked! 🎉*\n\nSelamat ${user.fullName}, kamu sudah respons 50 lead bulan ini!\nPertahankan performa hebatmu! 💪`;
        
        try {
          await this.waProvider.sendMessage({
            to: user.waPersonalNumber,
            message,
            tenantId,
          });
        } catch (error) {
          this.logger.error(`Failed to send achievement alert to ${user.waPersonalNumber}`, error);
        }
      }
    }
  }
}
