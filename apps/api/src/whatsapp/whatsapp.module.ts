import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { WHATSAPP_PROVIDER } from './interfaces/whatsapp-provider.interface';
import { FonnteService } from './providers/fonnte.service';
import { DisconnectDetectionService } from './tasks/disconnect-detection.service';
import { WhatsappController } from './controllers/whatsapp.controller';

@Module({
  imports: [
    HttpModule,
    BullModule.registerQueue({ name: 'ai-reply' }, { name: 'blast-campaign' }),
  ],
  providers: [
    {
      provide: WHATSAPP_PROVIDER,
      useClass: FonnteService,
    },
    DisconnectDetectionService,
  ],
  controllers: [WhatsappController],
  exports: [WHATSAPP_PROVIDER],
})
export class WhatsappModule {}
