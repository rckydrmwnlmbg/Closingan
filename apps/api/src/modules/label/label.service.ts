import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateLabelDto, AssignLabelDto } from './dto/label.dto';
import { AppException } from '../../common/exceptions/app.exception';

@Injectable()
export class LabelService {
  constructor(private readonly prisma: PrismaService) {}

  async createLabel(tenantId: string, dto: CreateLabelDto) {
    const existing = await this.prisma.conversationLabel.findUnique({
      where: {
        tenantId_name: {
          tenantId,
          name: dto.name,
        },
      },
    });

    if (existing) {
      throw new AppException('LABEL_EXISTS', 'Label dengan nama ini sudah ada', 400);
    }

    return this.prisma.conversationLabel.create({
      data: {
        tenantId,
        name: dto.name,
        color: dto.color,
      },
    });
  }

  async getLabels(tenantId: string) {
    return this.prisma.conversationLabel.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async assignLabel(tenantId: string, conversationId: string, dto: AssignLabelDto) {
    const label = await this.prisma.conversationLabel.findFirst({
      where: { id: dto.labelId, tenantId },
    });

    if (!label) {
      throw new AppException('LABEL_NOT_FOUND', 'Label tidak ditemukan', 404);
    }

    const conv = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId },
    });

    if (!conv) {
      throw new AppException('CONVERSATION_NOT_FOUND', 'Percakapan tidak ditemukan', 404);
    }

    // Upsert or Create assignment
    try {
      return await this.prisma.conversationLabelAssignment.create({
        data: {
          tenantId,
          conversationId,
          labelId: dto.labelId,
        },
        include: {
          label: true,
        },
      });
    } catch (e) {
      throw new AppException('LABEL_ALREADY_ASSIGNED', 'Label ini sudah ditambahkan pada percakapan', 400);
    }
  }

  async removeLabel(tenantId: string, conversationId: string, labelId: string) {
    const assignment = await this.prisma.conversationLabelAssignment.findUnique({
      where: {
        conversationId_labelId: {
          conversationId,
          labelId,
        },
      },
    });

    if (!assignment || assignment.tenantId !== tenantId) {
      throw new AppException('ASSIGNMENT_NOT_FOUND', 'Label tidak ada pada percakapan ini', 404);
    }

    await this.prisma.conversationLabelAssignment.delete({
      where: {
        id: assignment.id,
      },
    });

    return { success: true };
  }
}
