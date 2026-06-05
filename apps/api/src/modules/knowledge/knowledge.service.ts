import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class KnowledgeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, title: string, content: string) {
    return this.prisma.knowledgeAsset.create({
      data: {
        tenantId,
        title,
        content,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.knowledgeAsset.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const asset = await this.prisma.knowledgeAsset.findFirst({
      where: { id, tenantId },
    });

    if (!asset) {
      throw new NotFoundException(`Knowledge asset with ID ${id} not found`);
    }

    return asset;
  }

  async update(tenantId: string, id: string, title?: string, content?: string) {
    // First verify it exists and belongs to the tenant
    await this.findOne(tenantId, id);

    return this.prisma.knowledgeAsset.update({
      where: { id }, // Safe because we just checked tenantId above
      data: {
        ...(title && { title }),
        ...(content && { content }),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    // First verify it exists and belongs to the tenant
    await this.findOne(tenantId, id);

    return this.prisma.knowledgeAsset.delete({
      where: { id },
    });
  }
}
