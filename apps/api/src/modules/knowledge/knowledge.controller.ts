import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

class CreateKnowledgeDto {
  title: string;
  content: string;
}

class UpdateKnowledgeDto {
  title?: string;
  content?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post()
  create(
    @CurrentUser() user: { tenantId: string },
    @Body() createKnowledgeDto: CreateKnowledgeDto,
  ) {
    return this.knowledgeService.create(
      user.tenantId,
      createKnowledgeDto.title,
      createKnowledgeDto.content,
    );
  }

  @Get()
  findAll(@CurrentUser() user: { tenantId: string }) {
    return this.knowledgeService.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.knowledgeService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { tenantId: string },
    @Param('id') id: string,
    @Body() updateKnowledgeDto: UpdateKnowledgeDto,
  ) {
    return this.knowledgeService.update(
      user.tenantId,
      id,
      updateKnowledgeDto.title,
      updateKnowledgeDto.content,
    );
  }

  @Delete(':id')
  remove(@CurrentUser() user: { tenantId: string }, @Param('id') id: string) {
    return this.knowledgeService.remove(user.tenantId, id);
  }
}
