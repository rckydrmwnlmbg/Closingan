import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { BotConfigService } from './bot-config.service';
import { UpsertBotConfigDto } from './dto/upsert-bot-config.dto';
import { ResponseBuilder } from '../../common/helpers/response.builder';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('tenant/:tenantId/bot-config')
@UseGuards(JwtAuthGuard)
export class BotConfigController {
  constructor(private readonly botConfigService: BotConfigService) {}

  @Get()
  async getBotConfig(@Param('tenantId') tenantId: string) {
    const config = await this.botConfigService.getBotConfig(tenantId);
    return ResponseBuilder.success(config);
  }

  @Post()
  async createOrUpdateBotConfig(
    @Param('tenantId') tenantId: string,
    @Body() dto: UpsertBotConfigDto,
  ) {
    const config = await this.botConfigService.upsertBotConfig(tenantId, dto);
    return ResponseBuilder.success(config);
  }

  @Patch()
  async updateBotConfig(
    @Param('tenantId') tenantId: string,
    @Body() dto: UpsertBotConfigDto,
  ) {
    // Patch does the same as Post in this context due to upsert
    const config = await this.botConfigService.upsertBotConfig(tenantId, dto);
    return ResponseBuilder.success(config);
  }
}
