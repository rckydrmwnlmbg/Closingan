import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GetFollowUpsDto } from './dto/get-follow-ups.dto';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { SnoozeFollowUpDto } from './dto/snooze-follow-up.dto';
import { FollowUpStatus, FollowUpUrgency, Prisma } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class FollowUpService {
  constructor(private readonly prisma: PrismaService) {}

  async getFollowUps(tenantId: string, query: GetFollowUpsDto) {
    const { status, cursor, limit = 20 } = query;

    const where: Prisma.FollowUpWhereInput = { tenantId };
    if (status) {
      where.status = status;
    }

    const items = await this.prisma.followUp.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: [
        { status: 'desc' }, // OVERDUE, PENDING
        { urgency: 'desc' },
        { dueAt: 'asc' },
      ],
      include: {
        conversation: {
          select: {
            customerName: true,
          },
        },
      },
    });

    let nextCursor: string | null = null;
    const hasNext = items.length > limit;
    if (hasNext) {
      const nextItem = items.pop();
      nextCursor = nextItem!.id;
    }

    const data = items.map((f) => ({
      id: f.id,
      conversationId: f.conversationId,
      customerName: f.conversation.customerName,
      reason: f.reason,
      dueAt: f.dueAt.toISOString(),
      status: f.status,
      urgency: f.urgency,
      snoozedUntil: f.snoozedUntil?.toISOString() || null,
    }));

    return {
      data,
      meta: {
        nextCursor,
        hasNext,
      },
    };
  }

  async createFollowUp(
    tenantId: string,
    userId: string,
    dto: CreateFollowUpDto,
  ) {
    const followUp = await this.prisma.followUp.create({
      data: {
        tenantId,
        conversationId: dto.conversationId,
        reason: dto.reason,
        dueAt: dto.dueAt,
        urgency: dto.urgency,
        status: FollowUpStatus.PENDING,
        createdBy: userId,
      },
    });

    return followUp;
  }

  async completeFollowUp(tenantId: string, id: string) {
    const followUp = await this.prisma.followUp.findFirst({
      where: { id, tenantId },
    });

    if (!followUp) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Follow-up tidak ditemukan',
      });
    }

    await this.prisma.followUp.update({
      where: { id },
      data: {
        status: FollowUpStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    return { success: true };
  }

  async snoozeFollowUp(tenantId: string, id: string, dto: SnoozeFollowUpDto) {
    const followUp = await this.prisma.followUp.findFirst({
      where: { id, tenantId },
    });

    if (!followUp) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Follow-up tidak ditemukan',
      });
    }

    const updated = await this.prisma.followUp.update({
      where: { id },
      data: {
        status: FollowUpStatus.SNOOZED,
        snoozedUntil: dto.snoozedUntil,
      },
    });

    return {
      status: updated.status,
      snoozedUntil: updated.snoozedUntil,
    };
  }

  async deleteFollowUp(tenantId: string, id: string) {
    const followUp = await this.prisma.followUp.findFirst({
      where: { id, tenantId },
    });

    if (!followUp) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Follow-up tidak ditemukan',
      });
    }

    await this.prisma.followUp.delete({
      where: { id },
    });

    return { success: true };
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async processOverdueFollowUps() {
    const now = new Date();

    // Find DUE or PENDING follow-ups that are past their due date
    const overdueFollowUps = await this.prisma.followUp.findMany({
      where: {
        status: { in: [FollowUpStatus.PENDING, FollowUpStatus.DUE] },
        dueAt: { lt: now },
      },
    });

    for (const followUp of overdueFollowUps) {
      const hoursOverdue = (now.getTime() - followUp.dueAt.getTime()) / (1000 * 60 * 60);

      const updateData: Prisma.FollowUpUpdateInput = {
        status: FollowUpStatus.OVERDUE,
      };

      // If overdue > 48 hours, bump urgency to CRITICAL
      if (hoursOverdue > 48) {
        updateData.urgency = FollowUpUrgency.CRITICAL;
      }

      await this.prisma.followUp.update({
        where: { id: followUp.id },
        data: updateData,
      });
    }
  }
}
