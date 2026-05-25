import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { WHATSAPP_PROVIDER } from '../interfaces/whatsapp-provider.interface';
import type { WhatsappProviderInterface } from '../interfaces/whatsapp-provider.interface';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class DisconnectDetectionService {
  private readonly logger = new Logger(DisconnectDetectionService.name);

  constructor(
    private readonly cls: ClsService,
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    @Inject(WHATSAPP_PROVIDER)
    private readonly whatsappProvider: WhatsappProviderInterface,
    @InjectQueue('ai-reply') private readonly aiReplyQueue: Queue,
    @InjectQueue('blast-campaign') private readonly blastCampaignQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleDisconnectDetection() {
    this.logger.debug('Running disconnect detection task');

    // We fetch all active sessions that are CONNECTED or RECONNECTING
    const sessions = await this.prisma.whatsappSession.findMany({
      where: {
        state: {
          in: ['CONNECTED', 'RECONNECTING'],
        },
      },
      include: {
        tenant: {
          include: {
            users: {
              where: {
                role: 'SALES', // Assuming we want to alert sales, or maybe Admin. Let's get all users for simplicity and filter later.
              },
            },
          },
        },
      },
    });

    for (const session of sessions) {
      await this.cls.run(async () => {
        this.cls.set('tenantId', session.tenantId);

        try {
          if (session.state === 'CONNECTED') {
            await this.checkConnectedSession(session);
          } else if (session.state === 'RECONNECTING') {
            await this.checkReconnectingSession(session);
          }
        } catch (error: any) {
          this.logger.error(
            `Error processing session for tenant ${session.tenantId}: ${error.message}`,
          );
        }
      });
    }
  }

  private async checkConnectedSession(session: any) {
    const status = await this.whatsappProvider.checkConnectionStatus(
      session.tenantId,
    );

    if (!status.isConnected) {
      this.logger.warn(
        `WhatsApp disconnected detected for tenant ${session.tenantId}`,
      );

      // Update state
      await this.prisma.whatsappSession.update({
        where: { id: session.id, tenantId: session.tenantId },
        data: {
          state: 'RECONNECTING',
          lastDisconnectedAt: new Date(),
          reconnectAttempts: 0,
        },
      });

      // Audit log
      await this.auditService.log({
        action: 'WA_DISCONNECTED',
        tenantId: session.tenantId,
        entityType: 'WHATSAPP_SESSION',
        entityId: session.id,
      });

      // Send alert to sales
      await this.sendAlert(
        session,
        `[URGENT] WhatsApp Disconnected!\n\nSystem detected connection loss. Attempting auto-reconnect. Outgoing messages are paused.`,
      );
    }
  }

  private async checkReconnectingSession(session: any) {
    const lastDisconnect = session.lastDisconnectedAt || new Date();
    const minutesSinceDisconnect =
      (new Date().getTime() - lastDisconnect.getTime()) / 60000;

    // Retry every 5 minutes
    if (minutesSinceDisconnect >= 5 * (session.reconnectAttempts + 1)) {
      if (session.reconnectAttempts >= 3) {
        // Stop retrying
        await this.prisma.whatsappSession.update({
          where: { id: session.id, tenantId: session.tenantId },
          data: { state: 'DISCONNECTED' },
        });

        // Audit log for final disconnect
        await this.auditService.log({
          action: 'WA_DISCONNECTED',
          tenantId: session.tenantId,
          entityType: 'WHATSAPP_SESSION',
          entityId: session.id,
          metadata: { reason: 'max_retries_exceeded' },
        });

        await this.sendAlert(
          session,
          `[CRITICAL] WhatsApp Auto-Reconnect Failed 3x. Manual intervention required!`,
        );
        return;
      }

      this.logger.log(
        `Attempting reconnect for tenant ${session.tenantId} (Attempt ${session.reconnectAttempts + 1})`,
      );

      const status = await this.whatsappProvider.checkConnectionStatus(
        session.tenantId,
      );

      if (status.isConnected) {
        this.logger.log(
          `Successfully reconnected WhatsApp for tenant ${session.tenantId}`,
        );

        await this.prisma.whatsappSession.update({
          where: { id: session.id, tenantId: session.tenantId },
          data: {
            state: 'CONNECTED',
            lastConnectedAt: new Date(),
            reconnectAttempts: 0,
          },
        });

        await this.auditService.log({
          action: 'WA_CONNECTED',
          tenantId: session.tenantId,
          entityType: 'WHATSAPP_SESSION',
          entityId: session.id,
        });

        await this.sendAlert(
          session,
          `[INFO] WhatsApp successfully reconnected. System is back to normal.`,
        );
      } else {
        await this.prisma.whatsappSession.update({
          where: { id: session.id, tenantId: session.tenantId },
          data: {
            reconnectAttempts: { increment: 1 },
          },
        });

        // Log attempt
        this.logger.warn(
          `Reconnect failed for tenant ${session.tenantId} (Attempt ${session.reconnectAttempts + 1})`,
        );
      }
    }
  }

  private async sendAlert(session: any, message: string) {
    // Find users with verified personal numbers
    const salesUsers = session.tenant.users.filter(
      (u: any) => u.waPersonalNumber && u.waPersonalVerified,
    );

    for (const user of salesUsers) {
      await this.whatsappProvider.sendMessage({
        to: user.waPersonalNumber,
        message,
        tenantId: session.tenantId,
      });
    }
  }
}
