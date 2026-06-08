import { Controller, Post, Body } from '@nestjs/common';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { ResponseBuilder } from '../../common/helpers/response.builder';

@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  async create(@Body() createDeviceDto: CreateDeviceDto) {
    const device = await this.deviceService.create(createDeviceDto);
    return ResponseBuilder.success(device);
  }
}
