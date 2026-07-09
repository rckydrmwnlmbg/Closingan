import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { SystemAdminService } from './system-admin.service';
import { JwtAdminAuthGuard } from '../../common/guards/jwt-admin-auth.guard';

@Controller('admin')
export class SystemAdminController {
  constructor(private readonly adminService: SystemAdminService) {}

  @Post('login')
  login(
    @Body('email') email: string,
    @Body('password') pass: string,
  ) {
    return this.adminService.login(email, pass);
  }

  @Get('tenants')
  @UseGuards(JwtAdminAuthGuard)
  getTenants(

    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.adminService.getTenants(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get('metrics')
  @UseGuards(JwtAdminAuthGuard)
  getMetrics() {
    return this.adminService.getMetrics();
  }

  @Post('tenants/:id/suspend')
  @UseGuards(JwtAdminAuthGuard)
  suspendTenant(
    @Param('id') tenantId: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    // req.user comes from JwtAdminStrategy
    return this.adminService.suspendTenant(tenantId, reason, req.user.userId);
  }
}
