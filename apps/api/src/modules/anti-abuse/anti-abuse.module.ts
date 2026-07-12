import { Module } from '@nestjs/common';
import { AntiAbuseController } from './anti-abuse.controller';
import { FairUsageService } from './fair-usage.service';
import { FairUsageController } from './fair-usage.controller';

@Module({
  controllers: [AntiAbuseController, FairUsageController],
  providers: [FairUsageService],
  exports: [FairUsageService],
})
export class AntiAbuseControllerModule {}

