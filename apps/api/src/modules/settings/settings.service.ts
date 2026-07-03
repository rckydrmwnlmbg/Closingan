import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AppException } from '../../common/exceptions/app.exception';
import {
  UpdateAiSettingsDto,
  UpdateNotificationSettingsDto,
  AddSuppressionDto,
  QuickReplyDto,
} from './settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getWhatsappStatus(tenantId: string) {
    const session = await this.prisma.whatsappSession.findUnique({
      where: { tenantId },
    });
    return session || { state: 'DISCONNECTED' };
  }

  async getAiSettings(tenantId: string) {
    let botConfig = await this.prisma.botConfig.findUnique({
      where: { tenantId },
    });
    if (!botConfig) {
      botConfig = await this.prisma.botConfig.create({
        data: {
          tenantId,
          systemPrompt: '',
          greetingMessage: '',
          businessContext: '',
        },
      });
    }
    return botConfig;
  }

  async updateAiSettings(tenantId: string, dto: UpdateAiSettingsDto) {
    return this.prisma.botConfig.upsert({
      where: { tenantId },
      update: dto,
      create: {
        tenantId,
        systemPrompt: dto.systemPrompt || '',
        greetingMessage: dto.greetingMessage || '',
        businessContext: dto.businessContext || '',
      },
    });
  }

  async getNotificationSettings(tenantId: string) {
    let prefs = await this.prisma.notificationPreference.findUnique({
      where: { tenantId },
    });
    if (!prefs) {
      prefs = await this.prisma.notificationPreference.create({
        data: { tenantId },
      });
    }
    return prefs;
  }

  async updateNotificationSettings(
    tenantId: string,
    dto: UpdateNotificationSettingsDto,
  ) {
    return this.prisma.notificationPreference.upsert({
      where: { tenantId },
      update: dto,
      create: { tenantId, ...dto },
    });
  }

  async getSuppressionList(tenantId: string) {
    return this.prisma.suppressionList.findMany({
      where: { tenantId },
      orderBy: { addedAt: 'desc' },
    });
  }

  async addSuppression(tenantId: string, dto: AddSuppressionDto) {
    return this.prisma.suppressionList.create({
      data: {
        tenantId,
        phoneNumber: dto.phoneNumber,
        phoneNormalized: dto.phoneNumber,
        reason: dto.reason || 'Manual addition',
        addedBy: 'SYSTEM',
      },
    });
  }

  async removeSuppression(tenantId: string, id: string) {
    await this.prisma.suppressionList.deleteMany({
      where: { id, tenantId },
    });
    return { success: true };
  }

  async getQuickReplies(tenantId: string) {
    return this.prisma.quickReplyTemplate.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addQuickReply(tenantId: string, dto: QuickReplyDto) {
    return this.prisma.quickReplyTemplate.create({
      data: {
        tenantId,
        name: dto.title,
        category: 'General',
        shortcut: dto.shortcut || '',
        ...dto,
      },
    });
  }

  async updateQuickReply(tenantId: string, id: string, dto: QuickReplyDto) {
    const existing = await this.prisma.quickReplyTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!existing)
      throw new AppException('NOT_FOUND', 'Quick reply not found', 404);

    return this.prisma.quickReplyTemplate.update({
      where: { id },
      data: dto,
    });
  }

  async deleteQuickReply(tenantId: string, id: string) {
    await this.prisma.quickReplyTemplate.deleteMany({
      where: { id, tenantId },
    });
    return { success: true };
  }

  async getReferralStatus(tenantId: string) {
    return this.prisma.referral.findMany({
      where: { referrerId: tenantId },
    });
  }
}
