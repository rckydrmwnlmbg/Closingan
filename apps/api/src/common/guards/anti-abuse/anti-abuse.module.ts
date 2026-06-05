import { Module } from '@nestjs/common';
import { AntiAbuseService } from './anti-abuse.service';
import { AntiAbuseGuard } from './anti-abuse.guard';

@Module({
  providers: [AntiAbuseService, AntiAbuseGuard],
  exports: [AntiAbuseService, AntiAbuseGuard],
})
export class AntiAbuseModule {}
