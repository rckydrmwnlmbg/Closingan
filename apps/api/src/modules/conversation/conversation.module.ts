import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { ConversationRepository } from './conversation.repository';
import { AiModule } from '../../ai/ai.module';
import { AuditModule } from '../../common/audit/audit.module';

@Module({
  imports: [AiModule, AuditModule],
  controllers: [ConversationController],
  providers: [ConversationService, ConversationRepository],
  exports: [ConversationService],
})
export class ConversationModule {}
