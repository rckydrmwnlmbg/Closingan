import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantId } from '../../../common/decorators/tenant.decorator';
import { ResponseBuilder } from '../../../common/helpers/response.builder';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingApiController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('subscription')
  async getSubscription(@TenantId() tenantId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });
    return ResponseBuilder.success(subscription);
  }

  @Get('invoices')
  async getInvoices(@TenantId() tenantId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return ResponseBuilder.list(invoices, { nextCursor: null, hasNext: false });
  }

  @Post('topup')
  async topup(@TenantId() tenantId: string, @Body('amount') amount: number) {
    // Basic mock implementation for creating a topup invoice
    // In production, Midtrans integration goes here
    const invoice = await this.prisma.invoice.create({
      data: {
        tenantId,
        amount,
        status: 'PENDING',
        paymentUrl: 'https://midtrans.mock/payment/' + Date.now(),
        subscriptionId: 'mock-sub-id', // Temporary mock
        description: 'Topup Mock',
        idempotencyKey: Date.now().toString(),
      },
    });

    return ResponseBuilder.success(invoice);
  }
}
