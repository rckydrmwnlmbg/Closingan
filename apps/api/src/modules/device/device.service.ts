import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import * as crypto from 'crypto';

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, createDeviceDto: CreateDeviceDto) {
    this.logger.log({
      message: `Creating new device for tenant: ${tenantId}`,
    });

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const phoneNumberHash = crypto
      .createHash('sha256')
      .update(createDeviceDto.phoneNumber)
      .digest('hex');

    return this.prisma.whatsappSession.create({
      data: {
        tenantId: tenantId,
        phoneNumber: createDeviceDto.phoneNumber,
        phoneNumberHash,
        provider: 'FONNTE',
        state: 'DISCONNECTED',
      },
    });
  }
}
