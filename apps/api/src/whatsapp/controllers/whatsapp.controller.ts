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

  @Get('qr-status')
  async getQrStatus() {
    return this.getStatus();
  }

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
        where: { id: session.id, tenantId },
        data: { state: 'CONNECTED', lastConnectedAt: new Date() },
      });
    } else if (!status.isConnected && session.state === 'CONNECTED') {
      await this.prisma.whatsappSession.update({
        where: { id: session.id, tenantId },
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

  @Post('generate-qr')
  async generateQr() {
    const tenantId = this.cls.get('tenantId');
    if (!tenantId) {
      throw new InternalServerErrorException('Tenant context missing');
    }

    // Abstracted away in Fonnte via device APIs.
    let qrData;
    try {
      qrData = await this.whatsappProvider.generateQrCode(tenantId);
    } catch (error) {
      // In E2E tests, the mocked provider isn't injected if we don't mock it at the module level correctly.
      // So for test we fallback, or rely on correct DI
      throw error;
    }

    // Save QR to session
    let session = await this.prisma.whatsappSession.findUnique({
      where: { tenantId },
    });

    if (session) {
      await this.prisma.whatsappSession.update({
        where: { id: session.id, tenantId },
        data: {
          qrCode: qrData.qrData,
          qrExpiresAt: qrData.expiresAt,
        },
      });
    } else {
      session = await this.prisma.whatsappSession.create({
        data: {
          tenantId,
          qrCode: qrData.qrData,
          qrExpiresAt: qrData.expiresAt,
          state: 'DISCONNECTED',
        },
      });
    }

    return {
      success: true,
      data: {
        qrCodeUrl: qrData.qrData,
        expiresAt: qrData.expiresAt,
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
