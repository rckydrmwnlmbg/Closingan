import { Injectable, Logger } from '@nestjs/common';
import { AppException } from '../../common/exceptions/app.exception';
import { PrismaService } from '../../common/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('blast-campaign') private readonly blastQueue: Queue,
  ) {}

  async validateCampaignAudience(tenantId: string, campaignId: string) {
    const recipients = await this.prisma.campaignRecipient.findMany({
      where: { campaignId, tenantId, status: 'QUEUED' },
      select: { phoneNormalized: true },
    });

    const phoneNumbers = recipients.map((r) => r.phoneNormalized);

    const blacklisted = await this.prisma.suppressionList.findMany({
      where: {
        tenantId,
        isActive: true,
        phoneNormalized: { in: phoneNumbers },
      },
      select: { phoneNormalized: true, reason: true },
    });

    return {
      totalRecipients: phoneNumbers.length,
      blacklistedCount: blacklisted.length,
      blacklistedNumbers: blacklisted.map((b) => b.phoneNormalized),
    };
  }

  async executeCampaign(
    tenantId: string,
    campaignId: string,
    forceSend: string[] = [],
  ) {
    this.logger.log(`Executing campaign ${campaignId} for tenant ${tenantId}`);

    // Fetch the campaign and its recipients
    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId, tenantId },
    });

    if (!campaign) {
      throw new AppException(
        'CAMPAIGN_NOT_FOUND',
        'Campaign not found or does not belong to tenant',
        404,
      );
    }

    // Update status to IN_PROGRESS
    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'RUNNING', startedAt: new Date() },
    });

    let recipients = await this.prisma.campaignRecipient.findMany({
      where: { campaignId, tenantId, status: 'QUEUED' },
    });

    // Handle forceSend override
    if (forceSend && forceSend.length > 0) {
      await this.prisma.suppressionList.updateMany({
        where: {
          tenantId,
          phoneNormalized: { in: forceSend },
          isActive: true,
        },
        data: {
          isActive: false,
          removedAt: new Date(),
          removalReason: 'TENANT_OVERRIDE',
          removedBy: 'TENANT',
        },
      });
      this.logger.log(
        `Overridden suppression list for ${forceSend.length} numbers in tenant ${tenantId}`,
      );
    }

    // Filter out blacklisted numbers that are NOT in forceSend
    const activeSuppression = await this.prisma.suppressionList.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      select: { phoneNormalized: true },
    });
    const blacklistedNumbers = activeSuppression.map((s) => s.phoneNormalized);

    recipients = recipients.filter(
      (r) => !blacklistedNumbers.includes(r.phoneNormalized),
    );

    // Enqueue jobs with pacing (delay)
    // 1000ms base delay + additional delay per job
    const baseDelayMs = 2000;

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      const delay = i * baseDelayMs; // Pace: 1 message every 2 seconds

      await this.blastQueue.add(
        'send-blast',
        {
          tenantId,
          campaignId,
          recipientId: recipient.id,
        },
        {
          delay,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    }

    this.logger.log(
      `Enqueued ${recipients.length} messages for campaign ${campaignId}`,
    );
    return { success: true, enqueuedCount: recipients.length };
  }
}
