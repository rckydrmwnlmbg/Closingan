import { Test, TestingModule } from '@nestjs/testing';
import { QuotaController } from './quota.controller';
import { QuotaService } from '../services/quota.service';
import { MidtransPaymentService } from '../services/midtrans-payment.service';
import { ClsService } from 'nestjs-cls';
import { NotFoundException } from '@nestjs/common';

describe('QuotaController', () => {
  let controller: QuotaController;
  let quotaService: QuotaService;
  let midtransPaymentService: MidtransPaymentService;
  let clsService: ClsService;

  const mockQuotaService = {
    getTokenQuota: jest.fn(),
    getSubscription: jest.fn(),
  };

  const mockMidtransPaymentService = {
    createInvoice: jest.fn(),
  };

  const mockClsService = {
    get: jest.fn().mockReturnValue('tenant-1'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuotaController],
      providers: [
        { provide: QuotaService, useValue: mockQuotaService },
        { provide: MidtransPaymentService, useValue: mockMidtransPaymentService },
        { provide: ClsService, useValue: mockClsService },
      ],
    }).compile();

    controller = module.get<QuotaController>(QuotaController);
    quotaService = module.get<QuotaService>(QuotaService);
    midtransPaymentService = module.get<MidtransPaymentService>(MidtransPaymentService);
    clsService = module.get<ClsService>(ClsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getQuotaStatus', () => {
    it('should return quota status without upsell if usage is below 90%', async () => {
      mockQuotaService.getTokenQuota.mockResolvedValue({
        totalQuota: 1000,
        usedQuota: 500,
        extraCredits: 0,
      });

      const result = await controller.getQuotaStatus();

      expect(result).toEqual({
        totalQuota: 1000,
        messagesUsed: 500,
        extraCredits: 0,
      });
    });

    it('should return quota status with upsell if usage is >= 90% and extraCredits < 100', async () => {
      mockQuotaService.getTokenQuota.mockResolvedValue({
        totalQuota: 1000,
        usedQuota: 950,
        extraCredits: 50,
      });

      const result = await controller.getQuotaStatus();

      expect(result).toEqual({
        totalQuota: 1000,
        messagesUsed: 950,
        extraCredits: 50,
        upsell: {
          action: 'TOP_UP',
          packageName: '1000 AI Credits',
          price: 50000,
        },
      });
    });

    it('should return quota status without upsell if extraCredits >= 100 even if usage >= 90%', async () => {
      mockQuotaService.getTokenQuota.mockResolvedValue({
        totalQuota: 1000,
        usedQuota: 950,
        extraCredits: 150,
      });

      const result = await controller.getQuotaStatus();

      expect(result).toEqual({
        totalQuota: 1000,
        messagesUsed: 950,
        extraCredits: 150,
      });
    });
  });

  describe('buyAddon', () => {
    it('should create an invoice and return payment details', async () => {
      mockQuotaService.getSubscription.mockResolvedValue({ id: 'sub-1' });
      mockMidtransPaymentService.createInvoice.mockResolvedValue({
        paymentUrl: 'https://example.com/payment/token-123',
        invoiceId: 'inv-1',
      });

      const result = await controller.buyAddon();

      expect(quotaService.getSubscription).toHaveBeenCalledWith('tenant-1');
      expect(midtransPaymentService.createInvoice).toHaveBeenCalledWith(
        'tenant-1',
        'sub-1',
        50000,
        '1000 AI Credits Add-on'
      );
      expect(result).toEqual({
        success: true,
        data: {
          paymentUrl: 'https://example.com/payment/token-123',
          invoiceId: 'inv-1',
          token: 'token-123',
        },
      });
    });

    it('should throw NotFoundException if tenant has no active subscription', async () => {
      mockQuotaService.getSubscription.mockResolvedValue(null);

      await expect(controller.buyAddon()).rejects.toThrow(NotFoundException);
    });
  });
});
