import { Controller, Get } from '@nestjs/common';
import { ResponseBuilder } from '../common/helpers/response.builder';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return ResponseBuilder.success({ status: 'ok' });
  }
}
