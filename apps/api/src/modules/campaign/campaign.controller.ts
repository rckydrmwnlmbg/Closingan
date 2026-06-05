import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../../common/prisma/prisma.service';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignController {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly cls: ClsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getCampaigns() {
    const tenantId = this.cls.get('tenantId');
    const campaigns = await this.prisma.campaign.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        status: true,
        scheduledAt: true,
        sentCount: true,
        totalRecipients: true,
      },
    });
    return { success: true, data: campaigns };
  }

  @Post()
  async createCampaign(@Body() data: Record<string, any>) {
    const tenantId = this.cls.get('tenantId');
    const user = this.cls.get('user');

    const campaign = await this.prisma.campaign.create({
      data: {
        tenantId,
        name: data.name,
        goal: data.goal,
        messageTemplate: data.messageTemplate,
        recipientSource: data.recipientSource,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        createdBy: user?.id || 'system',
      },
    });
    return { success: true, data: campaign };
  }

  @Get(':id/validate')
  async validateCampaign(@Param('id') campaignId: string) {
    const tenantId = this.cls.get('tenantId');
    const result = await this.campaignService.validateCampaignAudience(
      tenantId,
      campaignId,
    );
    return { success: true, data: result };
  }

  @Post(':id/execute')
  async executeCampaign(
    @Param('id') campaignId: string,
    @Body('forceSend') forceSend: string[] = [],
  ) {
    const tenantId = this.cls.get('tenantId');
    const result = await this.campaignService.executeCampaign(
      tenantId,
      campaignId,
      forceSend,
    );
    return { success: true, data: result };
  }
}
