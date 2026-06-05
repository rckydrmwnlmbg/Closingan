import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { AiProviderInterface } from '../../ai/interfaces/ai-provider.interface';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('AI_PROVIDER') private readonly aiProvider: AiProviderInterface,
  ) {}

  async create(tenantId: string, title: string, content: string) {
    const asset = await this.prisma.knowledgeAsset.create({
      data: {
        tenantId,
        title,
        content,
      },
    });

    try {
      const { embedding } = await this.aiProvider.generateEmbedding(
        tenantId,
        content,
      );

      await this.prisma.$executeRawUnsafe(
        'UPDATE "KnowledgeAsset" SET embedding = $1::vector WHERE id = $2',
        `[${embedding.join(',')}]`,
        asset.id,
      );
    } catch (error) {
      this.logger.error(
        `Failed to generate/save embedding for new asset ${asset.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    return asset;
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

    const asset = await this.prisma.knowledgeAsset.update({
      where: { id }, // Safe because we just checked tenantId above
      data: {
        ...(title && { title }),
        ...(content && { content }),
      },
    });

    if (content) {
      try {
        const { embedding } = await this.aiProvider.generateEmbedding(
          tenantId,
          content,
        );

        await this.prisma.$executeRawUnsafe(
          'UPDATE "KnowledgeAsset" SET embedding = $1::vector WHERE id = $2',
          `[${embedding.join(',')}]`,
          asset.id,
        );
      } catch (error) {
        this.logger.error(
          `Failed to generate/save embedding for updated asset ${asset.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    return asset;
  }

  async remove(tenantId: string, id: string) {
    // First verify it exists and belongs to the tenant
    await this.findOne(tenantId, id);

    return this.prisma.knowledgeAsset.delete({
      where: { id },
    });
  }
}
