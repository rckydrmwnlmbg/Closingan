import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ResponseBuilder } from '../../common/helpers/response.builder';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private checkAdmin(req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
  }

  @Get('queue-health')
  async getQueueHealth(@Request() req: any) {
    this.checkAdmin(req);
    const health = await this.adminService.getQueueHealth();
    return ResponseBuilder.success(health);
  }

  @Get('failed-jobs')
  async getFailedJobs(@Request() req: any) {
    this.checkAdmin(req);
    const jobs = await this.adminService.getFailedJobs();
    return ResponseBuilder.list(jobs, { nextCursor: null, hasNext: false });
  }

  @Post('failed-jobs/:id/retry')
  async retryFailedJob(@Request() req: any, @Param('id') id: string) {
    this.checkAdmin(req);
    const result = await this.adminService.retryFailedJob(id);
    return ResponseBuilder.success(result);
  }

  @Get('business-metrics')
  async getBusinessMetrics(@Request() req: any) {
    this.checkAdmin(req);
    const metrics = await this.adminService.getBusinessMetrics();
    return ResponseBuilder.success(metrics);
  }

  @Get('ai-performance')
  async getAiPerformance(@Request() req: any) {
    this.checkAdmin(req);
    const performance = await this.adminService.getAiPerformance();
    return ResponseBuilder.success(performance);
  }

  @Get('at-risk-users')
  async getAtRiskUsers(@Request() req: any) {
    this.checkAdmin(req);
    const users = await this.adminService.getAtRiskUsers();
    return ResponseBuilder.list(users, { nextCursor: null, hasNext: false });
  }
}
