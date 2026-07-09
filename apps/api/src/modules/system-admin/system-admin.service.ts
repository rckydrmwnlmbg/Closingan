import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { QueueName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class SystemAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const admin = await this.prisma.systemAdmin.findUnique({
      where: { email },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, admin.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.systemAdmin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = { sub: admin.id, email: admin.email, role: admin.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }


  async getTenants(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subscription: { select: { plan: true, state: true } },
          _count: { select: { users: true, leads: true, conversations: true } },
        },
      }),
      this.prisma.tenant.count(),
    ]);

    return {
      data: tenants,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async getMetrics() {
    // Basic overall metrics
    const totalTenants = await this.prisma.tenant.count();
    const activeSubscriptions = await this.prisma.subscription.count({
      where: { state: 'ACTIVE' },
    });
    const failedMessages = await this.prisma.message.count({
      where: { deliveryState: 'FAILED' },
    });

    return {
      totalTenants,
      activeSubscriptions,
      failedMessages,
    };
  }

  async suspendTenant(tenantId: string, reason: string, adminId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { subscription: true },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    await this.prisma.$transaction(async (tx) => {
      if (tenant.subscription) {
        await tx.subscription.update({
          where: { tenantId },
          data: { state: 'SUSPENDED', suspendedAt: new Date() },
        });
      }

      await tx.auditLog.create({
        data: {
          tenantId,
          userId: adminId, // System admin ID can be tracked here
          action: 'PROFILE_UPDATED', // Or create a specific enum like TENANT_SUSPENDED
          metadata: { reason, action: 'SUSPEND_TENANT' },
        },
      });
    });

    return { success: true, message: 'Tenant suspended successfully' };
  }
}
