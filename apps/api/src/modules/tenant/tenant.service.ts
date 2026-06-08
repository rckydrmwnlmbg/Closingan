import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    this.logger.log({
      message: `Creating new tenant: ${createTenantDto.name}`,
    });

    return this.prisma.tenant.create({
      data: {
        name: createTenantDto.name,
      },
    });
  }
}
