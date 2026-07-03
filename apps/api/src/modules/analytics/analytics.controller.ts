import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { ResponseBuilder } from '../../common/helpers/response.builder';
import { TenantId } from '../../common/decorators/tenant.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  async getSummary(@TenantId() tenantId: string) {
    const data = await this.analyticsService.getSummary(tenantId);
    return ResponseBuilder.success(data);
  }

  @Get('seller')
  async getSellerAnalytics(@TenantId() tenantId: string) {
    const data = await this.analyticsService.getSellerAnalytics(tenantId);
    return ResponseBuilder.success(data);
  }
}
