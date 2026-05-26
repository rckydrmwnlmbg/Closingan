import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { ConversationRepository } from './conversation.repository';
import { AiModule } from '../../ai/ai.module';
import { AuditModule } from '../../common/audit/audit.module';
import { WhatsappModule } from '../../whatsapp/whatsapp.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [AiModule, AuditModule, WhatsappModule, ConfigModule, RedisModule],
  controllers: [ConversationController],
  providers: [ConversationService, ConversationRepository],
  exports: [ConversationService],
})
export class ConversationModule {}
