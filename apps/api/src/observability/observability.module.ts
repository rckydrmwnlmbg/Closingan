import { Module } from '@nestjs/common';
import { ObservabilityMetricsService } from './observability-metrics.service';
import { ObservabilityAlertService } from './observability-alert.service';
import { RedisModule } from '../common/redis/redis.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [RedisModule, WhatsappModule],
  providers: [ObservabilityMetricsService, ObservabilityAlertService],
  exports: [ObservabilityMetricsService],
})
export class ObservabilityModule {}
