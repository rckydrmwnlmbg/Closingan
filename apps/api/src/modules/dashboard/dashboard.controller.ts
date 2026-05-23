import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { ResponseBuilder } from '../../common/helpers/response.builder';

@Controller('v1/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary() {
    const data = await this.dashboardService.getSummary();
    return ResponseBuilder.success(data);
  }
}
