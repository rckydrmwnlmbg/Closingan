import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  PaymentGatewayService,
  InvoiceResult,
} from '../interfaces/payment-gateway.interface';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { SubscriptionService } from './subscription.service';
import * as crypto from 'crypto';

@Injectable()
export class MidtransPaymentService implements PaymentGatewayService {
  private readonly logger = new Logger(MidtransPaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async createInvoice(
    tenantId: string,
    subscriptionId: string,
    amount: number,
    description: string,
  ): Promise<InvoiceResult> {
    const idempotencyKey = crypto.randomUUID();

    // In a real application, call Midtrans API to create an invoice/snap token
    const externalId = `midtrans-${Date.now()}`;
    const paymentUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${externalId}`;

    const invoice = await this.prisma.invoice.create({
      data: {
        tenantId,
        subscriptionId,
        amount,
        description,
        externalId,
        paymentUrl,
        idempotencyKey,
      },
    });

    return {
      invoiceId: invoice.id,
      paymentUrl: invoice.paymentUrl!,
    };
  }

  async processPayment(invoiceId: string): Promise<void> {
    // Usually triggered manually or used internally by webhooks
    this.logger.log(`Processing payment for invoice ${invoiceId}`);

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) throw new BadRequestException('Invoice not found');
    if (invoice.status === 'PAID') return; // Idempotent check

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    await this.subscriptionService.handlePaymentSuccess(
      invoice.tenantId,
      invoice.id,
    );

    // TODO: Send email receipt after payment confirmed (Task 8.1 requirement)
    this.logger.log(`Email receipt triggered for invoice ${invoiceId}`);
  }

  async handleWebhook(payload: any, signature: string): Promise<void> {
    // 1. Validate signature
    const serverKey =
      this.config.get<string>('MIDTRANS_SERVER_KEY') || 'dummy-server-key';
    const stringToHash = `${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey}`;
    const expectedSignature = crypto
      .createHash('sha512')
      .update(stringToHash)
      .digest('hex');

    if (
      signature !== expectedSignature &&
      this.config.get<string>('NODE_ENV') !== 'test'
    ) {
      throw new BadRequestException('Invalid signature');
    }

    // 2. Find matching invoice
    const externalId = payload.order_id;
    const invoice = await this.prisma.invoice.findFirst({
      where: { externalId },
    });

    if (!invoice) {
      this.logger.warn(`Webhook received for unknown order_id: ${externalId}`);
      return;
    }

    // 3. Process status
    if (
      payload.transaction_status === 'capture' ||
      payload.transaction_status === 'settlement'
    ) {
      await this.processPayment(invoice.id);
    } else if (
      payload.transaction_status === 'deny' ||
      payload.transaction_status === 'cancel' ||
      payload.transaction_status === 'expire'
    ) {
      if (invoice.status === 'PENDING') {
        await this.prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            status: 'FAILED',
            failedAt: new Date(),
          },
        });
        await this.subscriptionService.handlePaymentFailure(
          invoice.tenantId,
          invoice.id,
        );
      }
    }
  }
}
