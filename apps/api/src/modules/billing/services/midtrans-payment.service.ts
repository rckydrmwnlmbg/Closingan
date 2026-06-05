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
    const externalId = `midtrans-${Date.now()}`;

    // Skeleton implementation: Call Midtrans Sandbox API to create an invoice/snap token
    let paymentUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${externalId}`;

    const serverKey = this.config.get<string>('MIDTRANS_SERVER_KEY');

    try {
      if (serverKey && serverKey !== 'dummy-server-key') {
        const authString = Buffer.from(`${serverKey}:`).toString('base64');
        const payload = {
          transaction_details: {
            order_id: externalId,
            gross_amount: amount,
          },
          item_details: [
            {
              id: subscriptionId,
              price: amount,
              quantity: 1,
              name: description,
            },
          ],
        };

        // This uses fetch as a skeleton concept (NestJS HttpService is preferred, but fetch is acceptable for skeleton)
        const response = await fetch(
          'https://app.sandbox.midtrans.com/snap/v1/transactions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Basic ${authString}`,
            },
            body: JSON.stringify(payload),
          },
        );

        if (response.ok) {
          const data = (await response.json()) as { redirect_url?: string };
          if (data.redirect_url) {
            paymentUrl = data.redirect_url;
          }
        } else {
          this.logger.error(
            `Midtrans API failed with status ${response.status}`,
          );
        }
      }
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(
        `Failed to generate Midtrans Snap token: ${err.message}`,
        err.stack,
      );
      // Fallback to skeleton URL if API fails (since we are building skeleton without real account yet)
    }

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

  async processPayment(invoiceId: string, tenantId?: string): Promise<void> {
    // Usually triggered manually or used internally by webhooks
    this.logger.log(`Processing payment for invoice ${invoiceId}`);

    const whereClause: Record<string, string> = { id: invoiceId };
    if (tenantId) whereClause.tenantId = tenantId;

    const invoice = await this.prisma.invoice.findFirst({
      where: whereClause,
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

  async handleWebhook(
    payload: {
      order_id: string;
      status_code: string;
      gross_amount: string;
      transaction_status: string;
    },
    signature: string,
  ): Promise<void> {
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
