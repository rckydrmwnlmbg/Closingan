import { Test, TestingModule } from '@nestjs/testing';
import { MidtransPaymentService } from './midtrans-payment.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { SubscriptionService } from './subscription.service';
import { MailService } from '../../../mail/mail.service';
import { BadRequestException } from '@nestjs/common';

describe('MidtransPaymentService', () => {
  let service: MidtransPaymentService;
  let prisma: PrismaService;
  let subscriptionService: SubscriptionService;
  let mailService: MailService;
  let configService: ConfigService;

  const mockPrisma = {
    invoice: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        MIDTRANS_SERVER_KEY: 'test-server-key',
        NODE_ENV: 'test',
        SMTP_USER: '',
      };
      return config[key] || undefined;
    }),
  };

  const mockSubscriptionService = {
    handlePaymentSuccess: jest.fn(),
    handlePaymentFailure: jest.fn(),
  };

  const mockMailService = {
    sendPaymentReceipt: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MidtransPaymentService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: SubscriptionService, useValue: mockSubscriptionService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<MidtransPaymentService>(MidtransPaymentService);
    prisma = module.get<PrismaService>(PrismaService);
    subscriptionService = module.get<SubscriptionService>(SubscriptionService);
    mailService = module.get<MailService>(MailService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  describe('createInvoice', () => {
    it('should create an invoice record in database', async () => {
      const mockInvoice = {
        id: 'inv-123',
        tenantId: 'tenant-1',
        subscriptionId: 'sub-1',
        amount: 99000,
        description: 'Upgrade ke Starter',
        paymentUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/midtrans-123',
      };

      mockPrisma.invoice.create.mockResolvedValue(mockInvoice);

      const result = await service.createInvoice('tenant-1', 'sub-1', 99000, 'Upgrade ke Starter');

      expect(result.invoiceId).toBe('inv-123');
      expect(result.paymentUrl).toBeDefined();
      expect(mockPrisma.invoice.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('processPayment', () => {
    const mockInvoice = {
      id: 'inv-123',
      tenantId: 'tenant-1',
      subscriptionId: 'sub-1',
      amount: 99000,
      status: 'PENDING',
    };

    it('should mark invoice as PAID and call handlePaymentSuccess', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue(mockInvoice);
      mockPrisma.invoice.update.mockResolvedValue({ ...mockInvoice, status: 'PAID' });
      mockSubscriptionService.handlePaymentSuccess.mockResolvedValue({});
      mockPrisma.tenant.findUnique.mockResolvedValue({
        id: 'tenant-1',
        users: [{ email: 'user@test.com' }],
        subscription: { plan: 'STARTER' },
      });
      mockMailService.sendPaymentReceipt.mockResolvedValue(undefined);

      await service.processPayment('inv-123');

      expect(mockPrisma.invoice.update).toHaveBeenCalledWith({
        where: { id: 'inv-123' },
        data: expect.objectContaining({
          status: 'PAID',
          paidAt: expect.any(Date),
        }),
      });
      expect(mockSubscriptionService.handlePaymentSuccess).toHaveBeenCalledWith(
        'tenant-1',
        'inv-123',
      );
    });

    it('should send payment receipt email after successful payment', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue(mockInvoice);
      mockPrisma.invoice.update.mockResolvedValue({ ...mockInvoice, status: 'PAID' });
      mockSubscriptionService.handlePaymentSuccess.mockResolvedValue({});
      mockPrisma.tenant.findUnique.mockResolvedValue({
        id: 'tenant-1',
        users: [{ email: 'user@test.com' }],
        subscription: { plan: 'PRO' },
      });
      mockMailService.sendPaymentReceipt.mockResolvedValue(undefined);

      await service.processPayment('inv-123');

      expect(mockMailService.sendPaymentReceipt).toHaveBeenCalledWith(
        'user@test.com',
        expect.objectContaining({
          invoiceId: 'inv-123',
          amount: 99000,
          planLabel: expect.stringContaining('Pro'),
          paidAt: expect.any(Date),
        }),
      );
    });

    it('should be idempotent — skip if already PAID', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue({
        ...mockInvoice,
        status: 'PAID',
      });

      await service.processPayment('inv-123');

      expect(mockPrisma.invoice.update).not.toHaveBeenCalled();
      expect(mockSubscriptionService.handlePaymentSuccess).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if invoice not found', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue(null);

      await expect(service.processPayment('inv-999')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should not fail payment processing if email receipt fails', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue(mockInvoice);
      mockPrisma.invoice.update.mockResolvedValue({ ...mockInvoice, status: 'PAID' });
      mockSubscriptionService.handlePaymentSuccess.mockResolvedValue({});
      mockPrisma.tenant.findUnique.mockRejectedValue(new Error('DB error'));

      // Should NOT throw — email failure is non-critical
      await expect(service.processPayment('inv-123')).resolves.not.toThrow();
    });
  });

  describe('handleWebhook', () => {
    const basePayload = {
      order_id: 'midtrans-123',
      status_code: '200',
      gross_amount: '99000',
      transaction_status: 'settlement',
    };

    it('should process payment on settlement status', async () => {
      const mockInvoice = {
        id: 'inv-123',
        tenantId: 'tenant-1',
        status: 'PENDING',
        amount: 99000,
      };

      mockPrisma.invoice.findFirst.mockResolvedValue(mockInvoice);
      mockPrisma.invoice.update.mockResolvedValue({ ...mockInvoice, status: 'PAID' });
      mockSubscriptionService.handlePaymentSuccess.mockResolvedValue({});
      mockPrisma.tenant.findUnique.mockResolvedValue({
        id: 'tenant-1',
        users: [{ email: 'user@test.com' }],
        subscription: { plan: 'STARTER' },
      });

      await service.handleWebhook(basePayload, 'any-signature');

      expect(mockPrisma.invoice.findFirst).toHaveBeenCalledWith({
        where: { externalId: 'midtrans-123' },
      });
    });

    it('should handle failed/cancelled/expired transactions', async () => {
      const mockInvoice = {
        id: 'inv-123',
        tenantId: 'tenant-1',
        status: 'PENDING',
      };

      mockPrisma.invoice.findFirst.mockResolvedValue(mockInvoice);
      mockPrisma.invoice.update.mockResolvedValue({ ...mockInvoice, status: 'FAILED' });

      await service.handleWebhook(
        { ...basePayload, transaction_status: 'cancel' },
        'any-signature',
      );

      expect(mockPrisma.invoice.update).toHaveBeenCalledWith({
        where: { id: 'inv-123' },
        data: expect.objectContaining({
          status: 'FAILED',
          failedAt: expect.any(Date),
        }),
      });
    });

    it('should silently skip unknown order_id', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue(null);

      await service.handleWebhook(basePayload, 'any-signature');

      expect(mockPrisma.invoice.update).not.toHaveBeenCalled();
    });
  });
});
