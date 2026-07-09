import { Controller, Post, Body, Get, Patch, UseGuards } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { ResponseBuilder } from '../../common/helpers/response.builder';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  async create(@Body() createTenantDto: CreateTenantDto) {
    const tenant = await this.tenantService.create(createTenantDto);
    return ResponseBuilder.success(tenant);
  }

  @UseGuards(JwtAuthGuard)
  @Get('onboarding')
  async getOnboardingState(@TenantId() tenantId: string) {
    const state = await this.tenantService.getOnboardingState(tenantId);
    return ResponseBuilder.success(state);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('onboarding')
  async updateOnboardingState(
    @TenantId() tenantId: string,
    @Body('isOnboarded') isOnboarded: boolean,
    @Body('onboardingState') onboardingState: any,
  ) {
    const updated = await this.tenantService.updateOnboardingState(
      tenantId,
      isOnboarded,
      onboardingState,
    );
    return ResponseBuilder.success(updated);
  }

  @UseGuards(JwtAuthGuard)
  @Get('exit-survey/status')
  async getExitSurveyStatus(@TenantId() tenantId: string) {
    const status = await this.tenantService.checkExitSurveyEligibility(tenantId);
    return ResponseBuilder.success(status);
  }

  @UseGuards(JwtAuthGuard)
  @Post('exit-survey')
  async submitExitSurvey(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() data: { reason: string, reasonDetail?: string, npsScore?: number },
  ) {
    const response = await this.tenantService.submitExitSurvey(tenantId, user.userId, { reason: data.reason, reasonDetail: data.reasonDetail, npsScore: data.npsScore });
    return ResponseBuilder.success(response);
  }

  @UseGuards(JwtAuthGuard)
  @Post('exit-survey/accept-offer')
  async acceptSaveOffer(@TenantId() tenantId: string) {
    const response = await this.tenantService.acceptSaveOffer(tenantId);
    return ResponseBuilder.success(response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('referrals')
  async getReferrals(@TenantId() tenantId: string) {
    const referrals = await this.tenantService.getReferrals(tenantId);
    return ResponseBuilder.success(referrals);
  }
}
