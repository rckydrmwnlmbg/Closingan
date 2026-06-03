import * as crypto from 'crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GetFollowUpsDto } from './dto/get-follow-ups.dto';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { SnoozeFollowUpDto } from './dto/snooze-follow-up.dto';
import { FollowUpStatus, FollowUpUrgency, Prisma } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class FollowUpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getFollowUps(tenantId: string, query: GetFollowUpsDto) {
    const paramsHash = crypto
      .createHash('md5')
      .update(JSON.stringify(query))
      .digest('hex');
    const cacheKey = `followups:${tenantId}:${paramsHash}`;

    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

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

    const result = {
      data,
      meta: {
        nextCursor,
        hasNext,
      },
    };

    await this.redisService.set(cacheKey, JSON.stringify(result), 30);
    return result;
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

    // Invalidate cache
    await this.redisService.delPattern(`followups:${tenantId}:*`);

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

    // Invalidate cache
    await this.redisService.delPattern(`followups:${tenantId}:*`);

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

    // Invalidate cache
    await this.redisService.delPattern(`followups:${tenantId}:*`);

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

    // Invalidate cache
    await this.redisService.delPattern(`followups:${tenantId}:*`);

    return { success: true };
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async processOverdueFollowUps() {
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // 1. Update those that are overdue but <= 48 hours
    await this.prisma.followUp.updateMany({
      where: {
        status: { in: [FollowUpStatus.PENDING, FollowUpStatus.DUE] },
        dueAt: { lt: now, gte: fortyEightHoursAgo },
      },
      data: {
        status: FollowUpStatus.OVERDUE,
      },
    });

    // 2. Update those that are overdue > 48 hours (bump urgency to CRITICAL)
    await this.prisma.followUp.updateMany({
      where: {
        status: {
          in: [
            FollowUpStatus.PENDING,
            FollowUpStatus.DUE,
            FollowUpStatus.OVERDUE,
          ],
        },
        dueAt: { lt: fortyEightHoursAgo },
        urgency: { not: FollowUpUrgency.CRITICAL }, // Avoid unnecessary updates
      },
      data: {
        status: FollowUpStatus.OVERDUE,
        urgency: FollowUpUrgency.CRITICAL,
      },
    });
  }
}
