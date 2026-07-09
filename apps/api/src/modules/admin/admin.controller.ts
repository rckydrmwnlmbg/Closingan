import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
// import { ObjectionCategory } from '@prisma/client';
import { AdminService } from './admin.service';
import { ChurnService } from './churn.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ResponseBuilder } from '../../common/helpers/response.builder';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';

interface JwtPayload {
  userId: string;
  tenantId: string;
  role: string;
}

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly churnService: ChurnService,
  ) {}

  private checkAdmin(user: JwtPayload) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
  }

  /**
   * System status
   */
  @Get('system-status')
  async getSystemStatus(@CurrentUser() user: JwtPayload) {
    this.checkAdmin(user);
    const status = await this.adminService.getSystemStatus();
    return ResponseBuilder.success(status);
  }

  /**
   * Queue health — cross-tenant view (admin of any tenant can see their queue stats)
   */
  @Get('queue-health')
  async getQueueHealth(@CurrentUser() user: JwtPayload) {
    this.checkAdmin(user);
    const health = await this.adminService.getQueueHealth();
    return ResponseBuilder.success(health);
  }

  /**
   * Failed jobs
   */
  @Get('failed-jobs')
  async getFailedJobs(@CurrentUser() user: JwtPayload) {
    this.checkAdmin(user);
    const jobs = await this.adminService.getFailedJobs();
    return ResponseBuilder.list(jobs, { nextCursor: null, hasNext: false });
  }

  /**
   * Retry a failed job
   */
  @Post('failed-jobs/:id/retry')
  async retryFailedJob(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    this.checkAdmin(user);
    const result = await this.adminService.retryFailedJob(id);
    return ResponseBuilder.success(result);
  }

  /**
   * Business metrics — cross-tenant aggregate (founder view)
   */
  @Get('business-metrics')
  async getBusinessMetrics(@CurrentUser() user: JwtPayload) {
    this.checkAdmin(user);
    const metrics = await this.adminService.getBusinessMetrics();
    return ResponseBuilder.success(metrics);
  }

  /**
   * AI performance — cross-tenant aggregate
   */
  @Get('ai-performance')
  async getAiPerformance(@CurrentUser() user: JwtPayload) {
    this.checkAdmin(user);
    const performance = await this.adminService.getAiPerformance();
    return ResponseBuilder.success(performance);
  }

  /**
   * At-risk users by quota — cross-tenant (founder view)
   */
  @Get('at-risk-users')
  async getAtRiskUsers(@CurrentUser() user: JwtPayload) {
    this.checkAdmin(user);
    const users = await this.adminService.getAtRiskUsers();
    return ResponseBuilder.list(users, { nextCursor: null, hasNext: false });
  }

  /**
   * Get active churn signals globally (founder view)
   */
  @Get('churn-signals')
  async getChurnSignals(@CurrentUser() user: JwtPayload) {
    this.checkAdmin(user);
    const signals = await this.churnService.getActiveChurnSignals();
    return ResponseBuilder.list(signals, { nextCursor: null, hasNext: false });
  }

  /**
   * Churn status of the current tenant (for displaying in-app banner)
   */
  @Get('churn-signals/status')
  async getTenantChurnStatus(@TenantId() tenantId: string) {
    const signal = await this.churnService.getTenantChurnStatus(tenantId);
    return ResponseBuilder.success({
      atRisk: !!signal,
      signalType: signal?.signalType,
      notes: signal?.notes,
    });
  }

  /**
   * Knowledge Base Management
   */
  @Get('knowledge-base')
  async getKnowledgeBase(@CurrentUser() user: JwtPayload) {
    this.checkAdmin(user);
    const data = await this.adminService.getKnowledgeBase();
    return ResponseBuilder.list(data, { nextCursor: null, hasNext: false });
  }

  @Post('knowledge-base')
  async createKnowledgeBase(
    @CurrentUser() user: JwtPayload,
    @Body() body: { objectionPattern: string; recommendedResponse: string; category: string },
  ) {
    this.checkAdmin(user);
    const data = await this.adminService.createKnowledgeBase(user.tenantId, body);
    return ResponseBuilder.success(data);
  }

  @Put('knowledge-base/:id')
  async updateKnowledgeBase(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { objectionPattern?: string; recommendedResponse?: string; category?: string; isActive?: boolean },
  ) {
    this.checkAdmin(user);
    const data = await this.adminService.updateKnowledgeBase(id, body);
    return ResponseBuilder.success(data);
  }

  /**
   * Aggregate Exit Surveys (founder view)
   */
  @Get('exit-surveys/aggregate')
  async getExitSurveyAggregates(@CurrentUser() user: JwtPayload) {
    this.checkAdmin(user);
    const aggregates = await this.adminService.getExitSurveyAggregates();
    return ResponseBuilder.success(aggregates);
  }
}
