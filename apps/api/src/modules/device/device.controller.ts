import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { ResponseBuilder } from '../../common/helpers/response.builder';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@Controller('device')
@UseGuards(JwtAuthGuard)
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  async create(
    @TenantId() tenantId: string,
    @Body() createDeviceDto: CreateDeviceDto,
  ) {
    const device = await this.deviceService.create(tenantId, createDeviceDto);
    return ResponseBuilder.success(device);
  }
}
