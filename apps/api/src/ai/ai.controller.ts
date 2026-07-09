import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/tenant.decorator';
import { ResponseBuilder } from '../common/helpers/response.builder';
// import { AiFeedbackType } from '@prisma/client';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('feedback')
  async submitFeedback(
    @TenantId() tenantId: string,
    @Body() body: { messageId: string; feedbackType: string; aiSuggestion: string; actualReplySent?: string; objectionCategory?: string },
    @Req() req: any,
  ) {
    const feedback = await this.aiService.submitFeedback({
      tenantId,
      userId: req.user?.userId,
      messageId: body.messageId,
      feedbackType: body.feedbackType,
      aiSuggestion: body.aiSuggestion,
      actualReplySent: body.actualReplySent,
    });
    
    return ResponseBuilder.success(feedback);
  }
}
