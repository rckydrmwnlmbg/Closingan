import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HealthController } from './health.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'health-check',
    }),
  ],
  controllers: [HealthController],
})
export class HealthModule {}
