/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Body,
  Patch,
} from '@nestjs/common';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateAiModeDto } from './dto/update-ai-mode.dto';
import { ConversationService } from './conversation.service';
import { GetConversationsQueryDto } from './dto/get-conversations.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ResponseBuilder } from '../../common/helpers/response.builder';
@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationController {
  @Get('phone/:customerPhone/messages')
  async getMessagesByPhone(
    @TenantId() tenantId: string,
    @Param('customerPhone') customerPhone: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 30;
    const { data, meta } = await this.conversationService.getMessagesByPhone(
      tenantId,
      customerPhone,
      cursor,
      limitNum,
    );
    return ResponseBuilder.list(data, meta);
  }
  @Get(':id/messages')
  async getMessages(
    @TenantId() tenantId: string,
    @Param('id') conversationId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 30;
    const { data, meta } = await this.conversationService.getMessages(
      tenantId,
      conversationId,
      cursor,
      limitNum,
    );
    return ResponseBuilder.list(data, meta);
  }

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
    const { data, meta }: any = await this.conversationService.getConversations(
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

  @Get(':id')
  async getConversation(@TenantId() tenantId: string, @Param('id') id: string) {
    const conversation = await this.conversationService.getConversation(
      tenantId,
      id,
    );
    return ResponseBuilder.success(conversation);
  }

  @Patch(':id/ai-mode')
  async updateAiMode(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAiModeDto,
  ) {
    const updated = await this.conversationService.updateAiMode(
      tenantId,
      id,
      dto.aiMode,
    );
    return ResponseBuilder.success(updated);
  }

  @Patch(':id/archive')
  async archiveConversation(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    const archived = await this.conversationService.archiveConversation(
      tenantId,
      id,
    );
    return ResponseBuilder.success(archived);
  }
}
