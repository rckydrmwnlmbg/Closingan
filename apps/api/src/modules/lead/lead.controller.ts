import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ResponseBuilder } from '../../common/helpers/response.builder';
import { HotLeadService } from './hot-lead.service';
import { GetLeadsQueryDto } from './dto/get-leads.dto';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadController {
  constructor(private readonly hotLeadService: HotLeadService) {}

  @Get()
  async getLeads(
    @TenantId() tenantId: string,
    @Query() query: GetLeadsQueryDto,
  ) {
    const { data, meta } = await this.hotLeadService.getLeads(tenantId, query);
    return ResponseBuilder.list(data, meta);
  }
}
