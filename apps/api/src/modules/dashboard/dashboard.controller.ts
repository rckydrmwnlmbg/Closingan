import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { ResponseBuilder } from '../../common/helpers/response.builder';
import { TenantId } from '../../common/decorators/tenant.decorator';

@Controller('v1/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(@TenantId() tenantId: string) {
    const data = await this.dashboardService.getSummary(tenantId);
    return ResponseBuilder.success(data);
  }
}
