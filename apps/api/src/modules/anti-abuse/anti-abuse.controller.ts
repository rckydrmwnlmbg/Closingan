import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Controller('abuse')
export class AntiAbuseController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getAbusiveClients() {
    return this.prisma.abusiveClient.findMany({
      orderBy: { blockedAt: 'desc' },
    });
  }

  @Post('ban')
  async banClient(
    @Body()
    body: {
      ipAddress: string;
      fingerprintHash: string;
      reason: string;
    },
  ) {
    return this.prisma.abusiveClient.create({
      data: {
        ipAddress: body.ipAddress,
        fingerprintHash: body.fingerprintHash,
        reason: body.reason,
      },
    });
  }

  @Delete(':id')
  async pardonClient(@Param('id') id: string) {
    return this.prisma.abusiveClient.delete({
      where: { id },
    });
  }
}
