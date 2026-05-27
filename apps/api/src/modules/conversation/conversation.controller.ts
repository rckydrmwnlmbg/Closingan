import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Body,
} from '@nestjs/common';
import { SendMessageDto } from './dto/send-message.dto';
import { ConversationService } from './conversation.service';
import { GetConversationsQueryDto } from './dto/get-conversations.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ResponseBuilder } from '../../common/helpers/response.builder';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationController {
  @Post(':id/messages')
  async sendMessage(
    @TenantId() tenantId: string,
    @Param('id') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    const result = await this.conversationService.sendMessageManual(
      tenantId,
      conversationId,
      dto.content,
    );
    return ResponseBuilder.success(result);
  }

  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  async getConversations(
    @TenantId() tenantId: string,
    @Query() query: GetConversationsQueryDto,
  ) {
    const { data, meta } = await this.conversationService.getConversations(
      tenantId,
      query,
    );
    return ResponseBuilder.list(data, meta);
  }

  @Post(':id/ai-suggest')
  async aiSuggest(
    @TenantId() tenantId: string,
    @Param('id') conversationId: string,
  ) {
    const result = await this.conversationService.generateAiSuggestion(
      tenantId,
      conversationId,
    );
    return ResponseBuilder.success(result);
  }
}
