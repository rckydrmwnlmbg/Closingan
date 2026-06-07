import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { WHATSAPP_PROVIDER } from '../interfaces/whatsapp-provider.interface';
import type { WhatsappProviderInterface } from '../interfaces/whatsapp-provider.interface';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { WhatsappSession, Tenant, User } from '@prisma/client';

type SessionActionType =
  | 'TO_RECONNECT'
  | 'TO_DISCONNECT'
  | 'TO_CONNECT'
  | 'TO_INCREMENT'
  | 'NONE';

type SessionWithTenant = WhatsappSession & {
  tenant: Tenant & {
    users: User[];
  };
};

interface SessionAction {
  session: SessionWithTenant;
  action: SessionActionType;
}

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
    const sessions = (await this.prisma.whatsappSession.findMany({
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
    })) as SessionWithTenant[];

    if (sessions.length === 0) {
      return;
    }

    const actionResults: SessionAction[] = await Promise.all(
      sessions.map((session) =>
        this.cls.run(async () => {
          this.cls.set('tenantId', session.tenantId);

          try {
            if (session.state === 'CONNECTED') {
              const status = await this.whatsappProvider.checkConnectionStatus(
                session.tenantId,
              );
              if (!status.isConnected) {
                return { session, action: 'TO_RECONNECT' };
              }
            } else if (session.state === 'RECONNECTING') {
              const lastDisconnect = session.lastDisconnectedAt || new Date();
              const minutesSinceDisconnect =
                (new Date().getTime() - lastDisconnect.getTime()) / 60000;

              // Retry every 5 minutes
              if (
                minutesSinceDisconnect >=
                5 * (session.reconnectAttempts + 1)
              ) {
                if (session.reconnectAttempts >= 3) {
                  return { session, action: 'TO_DISCONNECT' };
                }

                const status =
                  await this.whatsappProvider.checkConnectionStatus(
                    session.tenantId,
                  );
                if (status.isConnected) {
                  return { session, action: 'TO_CONNECT' };
                } else {
                  return { session, action: 'TO_INCREMENT' };
                }
              }
            }
            return { session, action: 'NONE' };
          } catch (error: any) {
            this.logger.error(
              `Error processing session for tenant ${session.tenantId}: ${error instanceof Error ? error.message : String(error)}`,
            );
            return { session, action: 'NONE' };
          }
        }),
      ),
    );

    const toReconnect = actionResults.filter(
      (r) => r.action === 'TO_RECONNECT',
    );
    const toDisconnect = actionResults.filter(
      (r) => r.action === 'TO_DISCONNECT',
    );
    const toConnect = actionResults.filter((r) => r.action === 'TO_CONNECT');
    const toIncrement = actionResults.filter(
      (r) => r.action === 'TO_INCREMENT',
    );

    // 1. Batched Database Updates
    const updatePromises: Promise<any>[] = [];

    if (toReconnect.length > 0) {
      updatePromises.push(
        this.prisma.whatsappSession.updateMany({
          where: { id: { in: toReconnect.map((r) => r.session.id) } },
          data: {
            state: 'RECONNECTING',
            lastDisconnectedAt: new Date(),
            reconnectAttempts: 0,
          },
        }),
      );
    }

    if (toDisconnect.length > 0) {
      updatePromises.push(
        this.prisma.whatsappSession.updateMany({
          where: { id: { in: toDisconnect.map((r) => r.session.id) } },
          data: { state: 'DISCONNECTED' },
        }),
      );
    }

    if (toConnect.length > 0) {
      updatePromises.push(
        this.prisma.whatsappSession.updateMany({
          where: { id: { in: toConnect.map((r) => r.session.id) } },
          data: {
            state: 'CONNECTED',
            lastConnectedAt: new Date(),
            reconnectAttempts: 0,
          },
        }),
      );
    }

    if (toIncrement.length > 0) {
      updatePromises.push(
        this.prisma.whatsappSession.updateMany({
          where: { id: { in: toIncrement.map((r) => r.session.id) } },
          data: { reconnectAttempts: { increment: 1 } },
        }),
      );
    }

    await Promise.all(updatePromises);

    // 2. Perform side effects (Logging, Alerts, Audit) using Promise.all to minimize latency
    const sideEffectPromises: Promise<any>[] = [];

    toReconnect.forEach(({ session }) => {
      this.logger.warn(
        `WhatsApp disconnected detected for tenant ${session.tenantId}`,
      );
      sideEffectPromises.push(
        this.auditService.log({
          action: 'WA_DISCONNECTED',
          tenantId: session.tenantId,
          entityType: 'WHATSAPP_SESSION',
          entityId: session.id,
        }),
      );
      sideEffectPromises.push(
        this.sendAlert(
          session,
          `[URGENT] WhatsApp Disconnected!\n\nSystem detected connection loss. Attempting auto-reconnect. Outgoing messages are paused.`,
        ),
      );
    });

    toDisconnect.forEach(({ session }) => {
      sideEffectPromises.push(
        this.auditService.log({
          action: 'WA_DISCONNECTED',
          tenantId: session.tenantId,
          entityType: 'WHATSAPP_SESSION',
          entityId: session.id,
          metadata: { reason: 'max_retries_exceeded' },
        }),
      );
      sideEffectPromises.push(
        this.sendAlert(
          session,
          `[CRITICAL] WhatsApp Auto-Reconnect Failed 3x. Manual intervention required!`,
        ),
      );
    });

    toConnect.forEach(({ session }) => {
      this.logger.log(
        `Successfully reconnected WhatsApp for tenant ${session.tenantId}`,
      );
      sideEffectPromises.push(
        this.auditService.log({
          action: 'WA_CONNECTED',
          tenantId: session.tenantId,
          entityType: 'WHATSAPP_SESSION',
          entityId: session.id,
        }),
      );
      sideEffectPromises.push(
        this.sendAlert(
          session,
          `[INFO] WhatsApp successfully reconnected. System is back to normal.`,
        ),
      );
    });

    toIncrement.forEach(({ session }) => {
      this.logger.warn(
        `Reconnect failed for tenant ${session.tenantId} (Attempt ${session.reconnectAttempts + 1})`,
      );
    });

    await Promise.all(sideEffectPromises);
  }

  private async sendAlert(session: SessionWithTenant, message: string) {
    // Find users with verified personal numbers
    const salesUsers =
      session.tenant?.users?.filter(
        (u: User) => u.waPersonalNumber && u.waPersonalVerified,
      ) || [];

    if (salesUsers.length === 0) return;

    await Promise.all(
      salesUsers.map((user: User) =>
        this.whatsappProvider.sendMessage({
          to: String(user.waPersonalNumber),
          message,
          tenantId: session.tenantId,
        }),
      ),
    );
  }
}
