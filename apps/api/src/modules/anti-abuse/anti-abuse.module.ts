import { Module } from '@nestjs/common';
import { AntiAbuseController } from './anti-abuse.controller';

@Module({
  controllers: [AntiAbuseController],
})
export class AntiAbuseControllerModule {}
