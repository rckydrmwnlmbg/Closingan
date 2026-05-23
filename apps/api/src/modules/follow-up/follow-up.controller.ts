import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FollowUpService } from './follow-up.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { GetFollowUpsDto } from './dto/get-follow-ups.dto';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { SnoozeFollowUpDto } from './dto/snooze-follow-up.dto';
import { ResponseBuilder } from '../../common/helpers/response.builder';

@Controller('follow-ups')
@UseGuards(JwtAuthGuard)
export class FollowUpController {
  constructor(private readonly followUpService: FollowUpService) {}

  @Get()
  async getFollowUps(
    @TenantId() tenantId: string,
    @Query() query: GetFollowUpsDto,
  ) {
    const { data, meta } = await this.followUpService.getFollowUps(
      tenantId,
      query,
    );
    return ResponseBuilder.list(data, meta);
  }

  @Post()
  async createFollowUp(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateFollowUpDto,
  ) {
    const data = await this.followUpService.createFollowUp(
      tenantId,
      user.id,
      dto,
    );
    return ResponseBuilder.success(data);
  }

  @Patch(':id/complete')
  async completeFollowUp(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.followUpService.completeFollowUp(tenantId, id);
    return ResponseBuilder.success(null);
  }

  @Patch(':id/snooze')
  async snoozeFollowUp(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: SnoozeFollowUpDto,
  ) {
    const data = await this.followUpService.snoozeFollowUp(tenantId, id, dto);
    return ResponseBuilder.success(data);
  }

  @Delete(':id')
  async deleteFollowUp(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.followUpService.deleteFollowUp(tenantId, id);
    return ResponseBuilder.success(null);
  }
}
