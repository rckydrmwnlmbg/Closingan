import { Test, TestingModule } from '@nestjs/testing';
import { BillingController } from './billing.controller';
import { MidtransPaymentService } from './services/midtrans-payment.service';
import { BadRequestException } from '@nestjs/common';

describe('BillingController', () => {
  let controller: BillingController;
  let midtransService: MidtransPaymentService;

  const mockMidtransService = {
    handleWebhook: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillingController],
      providers: [
        { provide: MidtransPaymentService, useValue: mockMidtransService },
      ],
    }).compile();

    controller = module.get<BillingController>(BillingController);
    midtransService = module.get<MidtransPaymentService>(
      MidtransPaymentService,
    );

    jest.clearAllMocks();
  });

  describe('handlePaymentWebhook', () => {
    it('should throw BadRequestException if signature is missing', async () => {
      await expect(
        controller.handlePaymentWebhook(
          {
            order_id: '123',
            status_code: '200',
            gross_amount: '1000',
            transaction_status: 'settlement',
          },
          '',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call midtransService.handleWebhook if signature is present', async () => {
      mockMidtransService.handleWebhook.mockResolvedValue(undefined);

      const result = await controller.handlePaymentWebhook(
        {
          order_id: '123',
          status_code: '200',
          gross_amount: '1000',
          transaction_status: 'settlement',
        },
        'valid-signature',
      );

      expect(result).toEqual({ success: true });
      expect(midtransService.handleWebhook).toHaveBeenCalledWith(
        {
          order_id: '123',
          status_code: '200',
          gross_amount: '1000',
          transaction_status: 'settlement',
        },
        'valid-signature',
      );
    });
  });
});
