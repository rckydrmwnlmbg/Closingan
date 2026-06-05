import { Module } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { QueueModule } from '../../queue/queue.module';

@Module({
  imports: [PrismaModule, QueueModule],
  providers: [CampaignService],
  exports: [CampaignService],
})
export class CampaignModule {}
