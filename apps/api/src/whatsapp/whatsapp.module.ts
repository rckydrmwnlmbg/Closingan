import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WHATSAPP_PROVIDER } from './interfaces/whatsapp-provider.interface';
import { FonnteService } from './providers/fonnte.service';

@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: WHATSAPP_PROVIDER,
      useClass: FonnteService,
    },
  ],
  exports: [WHATSAPP_PROVIDER],
})
export class WhatsappModule {}
