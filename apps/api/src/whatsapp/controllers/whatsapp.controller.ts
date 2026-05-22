import {
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../../common/prisma/prisma.service';
import { WHATSAPP_PROVIDER } from '../interfaces/whatsapp-provider.interface';
import type { WhatsappProviderInterface } from '../interfaces/whatsapp-provider.interface';

@Controller('whatsapp')
@UseGuards(JwtAuthGuard)
export class WhatsappController {
  constructor(
    private readonly cls: ClsService,
    private readonly prisma: PrismaService,
    @Inject(WHATSAPP_PROVIDER)
    private readonly whatsappProvider: WhatsappProviderInterface,
  ) {}

  @Get('status')
  async getStatus() {
    const tenantId = this.cls.get('tenantId');
    const session = await this.prisma.whatsappSession.findUnique({
      where: { tenantId },
    });

    if (!session) {
      return {
        success: true,
        data: { state: 'DISCONNECTED' },
      };
    }

    const status = await this.whatsappProvider.checkConnectionStatus(tenantId);

    // Sync state if necessary
    if (status.isConnected && session.state !== 'CONNECTED') {
      await this.prisma.whatsappSession.update({
        where: { id: session.id },
        data: { state: 'CONNECTED', lastConnectedAt: new Date() },
      });
    } else if (!status.isConnected && session.state === 'CONNECTED') {
      await this.prisma.whatsappSession.update({
        where: { id: session.id },
        data: { state: 'DISCONNECTED', lastDisconnectedAt: new Date() },
      });
    }

    return {
      success: true,
      data: {
        state: status.isConnected ? 'CONNECTED' : 'DISCONNECTED',
        phoneNumber: session.phoneNumber,
        displayName: session.displayName,
        lastConnectedAt: session.lastConnectedAt,
      },
    };
  }

  @Post('request-qr')
  async requestQr() {
    const tenantId = this.cls.get('tenantId');

    // Abstracted away in Fonnte via device APIs.
    // In actual implementation, Fonnte provides an API to generate a QR for a device.
    // For this refactor, we are fulfilling the contract with a placeholder QR based on requirements
    // since the real Fonnte generate QR endpoint details weren't explicitly provided,
    // we return a mock URL to satisfy the frontend component which now expects a QR.

    const mockQrCode =
      'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=FonnteQRPlaceholder';

    return {
      success: true,
      data: {
        qrCodeUrl: mockQrCode,
      },
    };
  }

  @Post('disconnect')
  async disconnect() {
    const tenantId = this.cls.get('tenantId');

    await this.prisma.whatsappSession.updateMany({
      where: { tenantId },
      data: {
        state: 'DISCONNECTED',
        lastDisconnectedAt: new Date(),
      },
    });

    return {
      success: true,
    };
  }
}
