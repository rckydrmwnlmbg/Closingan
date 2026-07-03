import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import {
  UpdateAiSettingsDto,
  UpdateNotificationSettingsDto,
  AddSuppressionDto,
  QuickReplyDto,
} from './settings.dto';
import { ResponseBuilder } from '../../common/helpers/response.builder';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('whatsapp')
  async getWhatsapp(@TenantId() tenantId: string) {
    const status = await this.settingsService.getWhatsappStatus(tenantId);
    return ResponseBuilder.success(status);
  }

  @Get('ai')
  async getAi(@TenantId() tenantId: string) {
    const aiSettings = await this.settingsService.getAiSettings(tenantId);
    return ResponseBuilder.success(aiSettings);
  }

  @Patch('ai')
  async updateAi(
    @TenantId() tenantId: string,
    @Body() dto: UpdateAiSettingsDto,
  ) {
    const updated = await this.settingsService.updateAiSettings(tenantId, dto);
    return ResponseBuilder.success(updated);
  }

  @Get('notifications')
  async getNotifications(@TenantId() tenantId: string) {
    const prefs = await this.settingsService.getNotificationSettings(tenantId);
    return ResponseBuilder.success(prefs);
  }

  @Patch('notifications')
  async updateNotifications(
    @TenantId() tenantId: string,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    const updated = await this.settingsService.updateNotificationSettings(
      tenantId,
      dto,
    );
    return ResponseBuilder.success(updated);
  }

  @Get('suppression')
  async getSuppression(@TenantId() tenantId: string) {
    const list = await this.settingsService.getSuppressionList(tenantId);
    return ResponseBuilder.list(list, { nextCursor: null, hasNext: false });
  }

  @Post('suppression')
  async addSuppression(
    @TenantId() tenantId: string,
    @Body() dto: AddSuppressionDto,
  ) {
    const item = await this.settingsService.addSuppression(tenantId, dto);
    return ResponseBuilder.success(item);
  }

  @Delete('suppression/:id')
  async removeSuppression(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.settingsService.removeSuppression(tenantId, id);
    return ResponseBuilder.success({ success: true });
  }

  @Get('quick-replies')
  async getQuickReplies(@TenantId() tenantId: string) {
    const replies = await this.settingsService.getQuickReplies(tenantId);
    return ResponseBuilder.list(replies, { nextCursor: null, hasNext: false });
  }

  @Post('quick-replies')
  async addQuickReply(
    @TenantId() tenantId: string,
    @Body() dto: QuickReplyDto,
  ) {
    const reply = await this.settingsService.addQuickReply(tenantId, dto);
    return ResponseBuilder.success(reply);
  }

  @Patch('quick-replies/:id')
  async updateQuickReply(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: QuickReplyDto,
  ) {
    const reply = await this.settingsService.updateQuickReply(
      tenantId,
      id,
      dto,
    );
    return ResponseBuilder.success(reply);
  }

  @Delete('quick-replies/:id')
  async deleteQuickReply(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.settingsService.deleteQuickReply(tenantId, id);
    return ResponseBuilder.success({ success: true });
  }

  @Get('referral')
  async getReferral(@TenantId() tenantId: string) {
    const referrals = await this.settingsService.getReferralStatus(tenantId);
    return ResponseBuilder.list(referrals, {
      nextCursor: null,
      hasNext: false,
    });
  }
}
