import { Controller, Get } from '@nestjs/common';
import { ResponseBuilder } from '../common/helpers/response.builder';

@Controller('status')
export class StatusController {
  @Get()
  getStatus() {
    return ResponseBuilder.success({
      version: '1.0.0',
      status: 'OK',
      timestamp: new Date().toISOString(),
    });
  }
}
