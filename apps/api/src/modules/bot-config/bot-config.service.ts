import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpsertBotConfigDto } from './dto/upsert-bot-config.dto';

@Injectable()
export class BotConfigService {
  private readonly logger = new Logger(BotConfigService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getBotConfig(tenantId: string) {
    const config = await this.prisma.botConfig.findUnique({
      where: { tenantId },
    });

    if (!config) {
      throw new NotFoundException(
        'Bot configuration not found for this tenant',
      );
    }

    return config;
  }

  async upsertBotConfig(tenantId: string, dto: UpsertBotConfigDto) {
    this.logger.log({
      message: `Upserting bot config for tenant: ${tenantId}`,
      tenantId,
    });

    // Verify tenant exists
    const tenantExists = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenantExists) {
      throw new NotFoundException('Tenant not found');
    }

    const businessContext = dto.businessContext || '';

    const config = await this.prisma.botConfig.upsert({
      where: { tenantId },
      update: {
        systemPrompt: dto.systemPrompt,
        greetingMessage: dto.greetingMessage,
        businessContext,
      },
      create: {
        tenantId,
        systemPrompt: dto.systemPrompt,
        greetingMessage: dto.greetingMessage,
        businessContext,
      },
    });

    return config;
  }
}
