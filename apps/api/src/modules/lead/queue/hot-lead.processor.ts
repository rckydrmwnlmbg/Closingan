import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Inject, OnModuleDestroy } from '@nestjs/common';
import { Job } from 'bullmq';
import { ClsService } from 'nestjs-cls';
import { HotLeadJobData } from '../../../queue/interfaces/job-data.interface';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../../../mail/mail.service';
import { ConversationGateway } from '../../websocket/conversation.gateway';
import { WHATSAPP_PROVIDER } from '../../../whatsapp/interfaces/whatsapp-provider.interface';
import type { WhatsappProviderInterface } from '../../../whatsapp/interfaces/whatsapp-provider.interface';
import { Redis } from 'ioredis';

@Processor('hot-lead')
export class HotLeadProcessor extends WorkerHost implements OnModuleDestroy {
  private readonly logger = new Logger(HotLeadProcessor.name);
  private redisClient: Redis;

  constructor(
    private readonly cls: ClsService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly conversationGateway: ConversationGateway,
    @Inject(WHATSAPP_PROVIDER) private readonly whatsappProvider: WhatsappProviderInterface,
  ) {
    super();
    this.redisClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
    });
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }

  async process(job: Job<HotLeadJobData, unknown, string>): Promise<unknown> {
    const { tenantId, leadId, conversationId, heatTier, heatReasons } = job.data;

    if (!tenantId || !leadId) {
      this.logger.warn(`Invalid job data for hot-lead: ${job.id}`);
      return;
    }

    // MEMORY REQUIREMENT: Background workers MUST explicitly wrap execution in cls.run()
    // and manually inject context variables like tenantId to maintain isolation.
    return this.cls.run(async () => {
      this.cls.set('tenantId', tenantId);
      this.logger.log(`Processing hot lead alert for lead: ${leadId}`);

      const lead = await this.prisma.lead.findUnique({
        where: { id: leadId },
      });

      if (!lead) {
        this.logger.warn(`Lead not found: ${leadId}`);
        return;
      }

      // 1. Fetch Notification Preference
      const pref = await this.prisma.notificationPreference.findUnique({
        where: { tenantId },
      });

      if (pref && !pref.hotLeadAlert) {
        this.logger.log(`Hot lead alerts are disabled for tenant ${tenantId}`);
        return;
      }

      // 2. Fetch main user/sales for this tenant
      // We assume the first user (or the one who created it) is the primary contact
      const user = await this.prisma.user.findFirst({
        where: { tenantId },
        orderBy: { createdAt: 'asc' },
      });

      if (!user) {
        this.logger.warn(`No user found for tenant ${tenantId} to send alert to`);
        return;
      }

      const leadNameOrPhone = lead.customerName || lead.customerPhone;
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      const deepLink = `${frontendUrl}/dashboard/conversations/${conversationId}`;

      // 3. WhatsApp Internal Alert Logic
      // Hard constraint: The system uses a centralized Master Token for internal alerts
      const masterToken = this.configService.get<string>('FONNTE_MASTER_TOKEN');

      if (masterToken && user.waPersonalNumber) {
        const redisKey = `hot-lead-alert:${tenantId}:${leadId}`;

        // Use atomic SET NX to prevent race conditions
        const acquiredLock = await this.redisClient.set(redisKey, '1', 'EX', 1800, 'NX');

        if (!acquiredLock) {
          this.logger.log(`Rate limited: skipping WA hot lead alert for lead ${leadId}`);
        } else {
          const waMessage = `🚨 *Peringatan Hot Lead!* 🚨\nProspek: ${leadNameOrPhone}\nKetertarikan: ${heatTier}\nAlasan: ${heatReasons.join(', ')}\nLink: ${deepLink}`;

          try {
            await this.whatsappProvider.sendMessage({
              to: user.waPersonalNumber,
              message: waMessage,
              tenantToken: masterToken, // Using master token for internal alerts
              tenantId: tenantId, // Context tracking
            });
            this.logger.log(`WhatsApp hot lead alert sent to user ${user.id}`);
          } catch (error) {
            // If it failed to send, delete the lock so we can try again on next job run
            await this.redisClient.del(redisKey);
            this.logger.error(`Failed to send WA hot lead alert to user ${user.id}: ${error instanceof Error ? error.message : 'Unknown'}`);
          }
        }
      } else {
        this.logger.warn(`Cannot send WA alert. Master token or user phone missing for user ${user.id}`);
      }

      // 4. Implementasi Email Alert Logic (Conditional)
      if (heatTier === 'CRITICAL' && user.email) {
        await this.mailService.sendHotLeadAlert(user.email, {
          leadName: leadNameOrPhone,
          tier: heatTier,
          reasons: heatReasons,
          link: deepLink,
        });
      }

      // 5. WebSocket Update
      this.conversationGateway.broadcastLeadHeatChanged(tenantId, {
        conversationId,
        heatTier,
        heatReasons,
      });

      return true;
    });
  }
}
