import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateQuickReplyDto } from './dto/quick-reply.dto';
import { AppException } from '../../common/exceptions/app.exception';

@Injectable()
export class QuickReplyService {
  constructor(private readonly prisma: PrismaService) {}

  async createTemplate(tenantId: string, dto: CreateQuickReplyDto) {
    const existing = await this.prisma.quickReplyTemplate.findFirst({
      where: {
        tenantId,
        shortcut: dto.shortcut,
      },
    });

    if (existing) {
      throw new AppException('SHORTCUT_EXISTS', 'Shortcut ini sudah digunakan', 400);
    }

    return this.prisma.quickReplyTemplate.create({
      data: {
        tenantId,
        name: dto.name,
        shortcut: dto.shortcut,
        content: dto.content,
        category: dto.category,
        variables: dto.variables || [],
      },
    });
  }

  async getTemplates(tenantId: string) {
    return this.prisma.quickReplyTemplate.findMany({
      where: { tenantId, isActive: true },
      orderBy: { usageCount: 'desc' },
    });
  }

  async incrementUsage(tenantId: string, id: string) {
    await this.prisma.quickReplyTemplate.updateMany({
      where: { id, tenantId },
      data: { usageCount: { increment: 1 } },
    });
    return { success: true };
  }
}
