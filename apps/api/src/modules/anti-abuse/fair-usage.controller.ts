import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { FairUsageService } from './fair-usage.service';
import { JwtAdminAuthGuard } from '../../common/guards/jwt-admin-auth.guard';
import { ResponseBuilder } from '../../common/helpers/response.builder';
import { AbuseFlagStatus } from '@prisma/client';

@Controller('admin/abuse-flags')
@UseGuards(JwtAdminAuthGuard)
export class FairUsageController {
  private readonly logger = new Logger(FairUsageController.name);

  constructor(private readonly fairUsageService: FairUsageService) {}

  /**
   * GET /admin/abuse-flags?status=PENDING
   * List all abuse flags with optional status filter
   */
  @Get()
  async listFlags(@Query('status') status?: string) {
    const validStatus = status && Object.values(AbuseFlagStatus).includes(status as AbuseFlagStatus)
      ? (status as AbuseFlagStatus)
      : undefined;

    const flags = await this.fairUsageService.getFlags(validStatus);
    return ResponseBuilder.success(flags);
  }

  /**
   * POST /admin/abuse-flags/:id/resolve
   * Resolve a flagged abuse entry
   */
  @Post(':id/resolve')
  async resolveFlag(
    @Param('id') flagId: string,
    @Body('reviewedBy') reviewedBy: string,
    @Body('resolution') resolution: string,
    @Body('dismiss') dismiss?: boolean,
  ) {
    const flag = await this.fairUsageService.resolveFlag(
      flagId,
      reviewedBy || 'admin',
      resolution || 'Reviewed by admin',
      dismiss ?? false,
    );

    this.logger.log({
      flagId,
      status: flag.status,
      msg: 'Abuse flag resolved',
    });

    return ResponseBuilder.success(flag);
  }

  /**
   * POST /admin/abuse-flags/scan
   * Manually trigger an anomaly scan (for testing)
   */
  @Post('scan')
  async triggerScan() {
    await this.fairUsageService.scanAllTenants();
    return ResponseBuilder.success({ message: 'Scan triggered successfully' });
  }
}
