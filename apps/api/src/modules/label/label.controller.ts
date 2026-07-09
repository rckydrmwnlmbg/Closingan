import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { LabelService } from './label.service';
import { CreateLabelDto, AssignLabelDto } from './dto/label.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ResponseBuilder } from '../../common/helpers/response.builder';

@Controller('labels')
@UseGuards(JwtAuthGuard)
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @Get()
  async getLabels(@TenantId() tenantId: string) {
    const labels = await this.labelService.getLabels(tenantId);
    return ResponseBuilder.success(labels);
  }

  @Post()
  async createLabel(
    @TenantId() tenantId: string,
    @Body() dto: CreateLabelDto,
  ) {
    const label = await this.labelService.createLabel(tenantId, dto);
    return ResponseBuilder.success(label);
  }

  @Post('conversations/:conversationId')
  async assignLabel(
    @TenantId() tenantId: string,
    @Param('conversationId') conversationId: string,
    @Body() dto: AssignLabelDto,
  ) {
    const assignment = await this.labelService.assignLabel(tenantId, conversationId, dto);
    return ResponseBuilder.success(assignment);
  }

  @Delete('conversations/:conversationId/:labelId')
  async removeLabel(
    @TenantId() tenantId: string,
    @Param('conversationId') conversationId: string,
    @Param('labelId') labelId: string,
  ) {
    const result = await this.labelService.removeLabel(tenantId, conversationId, labelId);
    return ResponseBuilder.success(result);
  }
}
