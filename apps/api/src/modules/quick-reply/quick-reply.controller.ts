import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { QuickReplyService } from './quick-reply.service';
import { CreateQuickReplyDto } from './dto/quick-reply.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ResponseBuilder } from '../../common/helpers/response.builder';

@Controller('quick-replies')
@UseGuards(JwtAuthGuard)
export class QuickReplyController {
  constructor(private readonly quickReplyService: QuickReplyService) {}

  @Get()
  async getTemplates(@TenantId() tenantId: string) {
    const templates = await this.quickReplyService.getTemplates(tenantId);
    return ResponseBuilder.success(templates);
  }

  @Post()
  async createTemplate(
    @TenantId() tenantId: string,
    @Body() dto: CreateQuickReplyDto,
  ) {
    const template = await this.quickReplyService.createTemplate(tenantId, dto);
    return ResponseBuilder.success(template);
  }

  @Post(':id/usage')
  async incrementUsage(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    const result = await this.quickReplyService.incrementUsage(tenantId, id);
    return ResponseBuilder.success(result);
  }
}
