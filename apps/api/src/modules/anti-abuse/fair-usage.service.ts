import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { AbuseFlagStatus, AbuseFlagType, Prisma } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppException } from '../../common/exceptions/app.exception';

interface AnomalyResult {
  flagType: AbuseFlagType;
  severity: string;
  details: Record<string, unknown>;
}

/** Average AI calls per hour per plan */
const PLAN_AVG_AI_CALLS_PER_HOUR: Record<string, number> = {
  STARTER: 20,
  PRO: 50,
  ELITE: 100,
};

@Injectable()
export class FairUsageService {
  private readonly logger = new Logger(FairUsageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Detect all anomalies for a specific tenant in the last hour
   */
  async detectAnomalies(tenantId: string): Promise<AnomalyResult[]> {
    const anomalies: AnomalyResult[] = [];
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 1. AI call rate > 10x average plan in 1 hour
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { tenantId },
      });
      const plan = subscription?.plan || 'STARTER';
      const avgCalls = PLAN_AVG_AI_CALLS_PER_HOUR[plan] || 20;

      const aiCallCount = await this.prisma.aiUsageLog.count({
        where: {
          tenantId,
          createdAt: { gte: oneHourAgo },
        },
      });

      if (aiCallCount > avgCalls * 10) {
        anomalies.push({
          flagType: AbuseFlagType.EXCESSIVE_AI_CALLS,
          severity: aiCallCount > avgCalls * 20 ? 'CRITICAL' : 'HIGH',
          details: {
            aiCallsLastHour: aiCallCount,
            planAverage: avgCalls,
            multiplier: Math.round(aiCallCount / avgCalls),
            plan,
          },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to check AI call rate for tenant ${tenantId}: ${error instanceof Error ? error.message : String(error)}`);
    }

    // 2. Campaign blast to same number > 3x in 7 days
    try {
      const repeatedBlasts = await this.prisma.$queryRaw<
        { phone: string; count: bigint }[]
      >`
        SELECT cr."recipientPhone" as phone, COUNT(*) as count
        FROM "CampaignRecipient" cr
        JOIN "Campaign" c ON cr."campaignId" = c.id
        WHERE c."tenantId" = ${tenantId}
          AND cr."sentAt" >= ${sevenDaysAgo}
          AND cr."status" = 'SENT'
        GROUP BY cr."recipientPhone"
        HAVING COUNT(*) > 3
        LIMIT 10
      `;

      if (repeatedBlasts.length > 0) {
        anomalies.push({
          flagType: AbuseFlagType.REPEATED_BLAST_SAME_NUMBER,
          severity: repeatedBlasts.length > 5 ? 'HIGH' : 'MEDIUM',
          details: {
            affectedNumbers: repeatedBlasts.length,
            topOffenders: repeatedBlasts.map((r) => ({
              phone: r.phone.slice(0, -4) + '****',
              count: Number(r.count),
            })),
          },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to check repeated blasts for tenant ${tenantId}: ${error instanceof Error ? error.message : String(error)}`);
    }

    // 3. Login from > 5 different IPs in 1 day
    try {
      const loginIps = await this.prisma.auditLog.findMany({
        where: {
          tenantId,
          action: 'USER_LOGIN',
          createdAt: { gte: oneDayAgo },
        },
        select: {
          metadata: true,
        },
      });

      const uniqueIps = new Set<string>();
      for (const log of loginIps) {
        const meta = log.metadata as Record<string, unknown> | null;
        if (meta?.ip && typeof meta.ip === 'string') {
          uniqueIps.add(meta.ip);
        }
      }

      if (uniqueIps.size > 5) {
        anomalies.push({
          flagType: AbuseFlagType.MULTI_IP_LOGIN,
          severity: uniqueIps.size > 10 ? 'HIGH' : 'MEDIUM',
          details: {
            uniqueIpCount: uniqueIps.size,
            period: '24h',
          },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to check multi-IP login for tenant ${tenantId}: ${error instanceof Error ? error.message : String(error)}`);
    }

    // 4. API call rate > 1000/hour (via analytics events as proxy)
    try {
      const apiCallCount = await this.prisma.analyticsEvent.count({
        where: {
          tenantId,
          createdAt: { gte: oneHourAgo },
        },
      });

      if (apiCallCount > 1000) {
        anomalies.push({
          flagType: AbuseFlagType.HIGH_API_RATE,
          severity: apiCallCount > 5000 ? 'CRITICAL' : 'HIGH',
          details: {
            apiCallsLastHour: apiCallCount,
            threshold: 1000,
          },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to check API rate for tenant ${tenantId}: ${error instanceof Error ? error.message : String(error)}`);
    }

    return anomalies;
  }

  /**
   * Create an abuse flag for a tenant
   */
  async createFlag(
    tenantId: string,
    anomaly: AnomalyResult,
  ) {
    // Deduplicate: don't create the same flag type within 1 hour
    const existingFlag = await this.prisma.abuseFlag.findFirst({
      where: {
        tenantId,
        flagType: anomaly.flagType,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });

    if (existingFlag) {
      this.logger.log(`Skipping duplicate flag ${anomaly.flagType} for tenant ${tenantId}`);
      return existingFlag;
    }

    const flag = await this.prisma.abuseFlag.create({
      data: {
        tenantId,
        flagType: anomaly.flagType,
        severity: anomaly.severity,
        details: anomaly.details as unknown as Prisma.InputJsonValue,
      },
    });

    this.logger.warn({
      tenantId,
      flagType: anomaly.flagType,
      severity: anomaly.severity,
      msg: 'New abuse flag created',
    });

    return flag;
  }

  /**
   * Get all abuse flags with optional status filter
   */
  async getFlags(status?: AbuseFlagStatus) {
    return this.prisma.abuseFlag.findMany({
      where: status ? { status } : undefined,
      include: {
        tenant: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  /**
   * Resolve an abuse flag (founder review action)
   */
  async resolveFlag(
    flagId: string,
    reviewedBy: string,
    resolution: string,
    dismiss: boolean = false,
  ) {
    const flag = await this.prisma.abuseFlag.findUnique({
      where: { id: flagId },
    });

    if (!flag) {
      throw new AppException('ABUSE_FLAG_NOT_FOUND', 'Flag tidak ditemukan.', 404);
    }

    return this.prisma.abuseFlag.update({
      where: { id: flagId },
      data: {
        status: dismiss ? AbuseFlagStatus.DISMISSED : AbuseFlagStatus.REVIEWED,
        reviewedAt: new Date(),
        reviewedBy,
        resolution,
      },
    });
  }

  /**
   * Cron job: scan all active tenants for anomalies every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async scanAllTenants() {
    this.logger.log('Starting fair usage anomaly scan...');

    try {
      const activeSubscriptions = await this.prisma.subscription.findMany({
        where: {
          state: { in: ['TRIAL', 'ACTIVE'] },
        },
        select: { tenantId: true },
      });

      let totalFlags = 0;

      for (const sub of activeSubscriptions) {
        try {
          const anomalies = await this.detectAnomalies(sub.tenantId);

          for (const anomaly of anomalies) {
            await this.createFlag(sub.tenantId, anomaly);
            totalFlags++;
          }
        } catch (error) {
          this.logger.error(
            `Failed to scan tenant ${sub.tenantId}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      // Send alert to founder if new flags were created
      if (totalFlags > 0) {
        const founderEmail = this.config.get<string>('FOUNDER_EMAIL');
        if (founderEmail) {
          await this.mailService.sendAbuseAlert(founderEmail, {
            tenantId: 'SYSTEM',
            flagType: 'BATCH_SCAN_RESULT',
            details: `${totalFlags} anomali baru terdeteksi dari ${activeSubscriptions.length} tenant aktif.`,
            severity: totalFlags > 5 ? 'CRITICAL' : 'HIGH',
          });
        }
      }

      this.logger.log(
        `Fair usage scan complete: ${activeSubscriptions.length} tenants scanned, ${totalFlags} flags created`,
      );
    } catch (error) {
      this.logger.error(
        `Fair usage scan failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
