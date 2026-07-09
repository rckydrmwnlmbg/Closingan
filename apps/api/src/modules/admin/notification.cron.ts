import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationCronService {
  private readonly logger = new Logger(NotificationCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}

  // Check every minute for daily digests to send at the user's preferred time
  @Cron(CronExpression.EVERY_MINUTE)
  async checkDailyDigests() {
    const now = new Date();
    // Get current time in HH:mm format (assuming UTC+7 for Indonesian time if configured, but let's just format the server time)
    // To match WIB reliably, we format the date in Asia/Jakarta timezone
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const currentTimeStr = timeFormatter.format(now);

    const preferences = await this.prisma.notificationPreference.findMany({
      where: {
        dailyDigest: true,
        dailyDigestTime: currentTimeStr,
      },
    });

    if (preferences.length > 0) {
      this.logger.log(`Found ${preferences.length} tenants for daily digest at ${currentTimeStr}`);
      for (const pref of preferences) {
        await this.notificationQueue.add('send-daily-digest', {
          type: 'DAILY_DIGEST',
          tenantId: pref.tenantId,
        });
      }
    }
  }

  // Weekly summary: runs every Monday at 08:00 WIB
  // Using an every minute check to account for timezone strictly
  @Cron(CronExpression.EVERY_MINUTE)
  async checkWeeklySummary() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    
    const formatted = formatter.formatToParts(now);
    const day = formatted.find(p => p.type === 'weekday')?.value;
    const hour = formatted.find(p => p.type === 'hour')?.value;
    const minute = formatted.find(p => p.type === 'minute')?.value;
    
    if (day === 'Monday' && hour === '08' && minute === '00') {
      const preferences = await this.prisma.notificationPreference.findMany({
        where: { weeklySummary: true },
      });

      if (preferences.length > 0) {
        this.logger.log(`Found ${preferences.length} tenants for weekly summary`);
        for (const pref of preferences) {
          await this.notificationQueue.add('send-weekly-summary', {
            type: 'WEEKLY_SUMMARY',
            tenantId: pref.tenantId,
          });
        }
      }
    }
  }

  // Idle Alert: Runs daily at 10:00 WIB
  @Cron(CronExpression.EVERY_MINUTE)
  async checkIdleAlert() {
    const now = new Date();
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const currentTimeStr = timeFormatter.format(now);

    if (currentTimeStr === '10:00') {
      const preferences = await this.prisma.notificationPreference.findMany({
        where: { idleAlert: true },
      });

      if (preferences.length > 0) {
        this.logger.log(`Found ${preferences.length} tenants for idle alert check`);
        for (const pref of preferences) {
          await this.notificationQueue.add('send-idle-alert', {
            type: 'IDLE_ALERT',
            tenantId: pref.tenantId,
          });
        }
      }
    }
  }

  // Achievement Alert: Runs daily at 17:00 WIB
  @Cron(CronExpression.EVERY_MINUTE)
  async checkAchievementAlert() {
    const now = new Date();
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const currentTimeStr = timeFormatter.format(now);

    if (currentTimeStr === '17:00') {
      const preferences = await this.prisma.notificationPreference.findMany({
        where: { achievementAlert: true },
      });

      if (preferences.length > 0) {
        this.logger.log(`Found ${preferences.length} tenants for achievement check`);
        for (const pref of preferences) {
          await this.notificationQueue.add('send-achievement-alert', {
            type: 'ACHIEVEMENT_ALERT',
            tenantId: pref.tenantId,
          });
        }
      }
    }
  }
}
