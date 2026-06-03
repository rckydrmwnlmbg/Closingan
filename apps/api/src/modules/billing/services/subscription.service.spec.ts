import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionService } from './subscription.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuditService } from '../../../common/audit/audit.service';
import { ClsService } from 'nestjs-cls';
import { SubscriptionState, SubscriptionPlan } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let prismaService: PrismaService;
  let auditService: AuditService;

  const mockPrismaService = {
    subscription: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  const mockClsService = {
    get: jest.fn().mockReturnValue('test-tenant-123'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: ClsService, useValue: mockClsService },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    prismaService = module.get<PrismaService>(PrismaService);
    auditService = module.get<AuditService>(AuditService);

    jest.clearAllMocks();
  });

  describe('handleTrialExpiry', () => {
    it('should transition from TRIAL to PAST_DUE', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        tenantId: 'tenant-1',
        state: SubscriptionState.TRIAL,
      });

      mockPrismaService.subscription.update.mockResolvedValue({
        id: 'sub-1',
        tenantId: 'tenant-1',
        state: SubscriptionState.PAST_DUE,
      });

      const result = await service.handleTrialExpiry('tenant-1');

      expect(result.state).toBe(SubscriptionState.PAST_DUE);
      expect(prismaService.subscription.update).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        data: expect.objectContaining({ state: SubscriptionState.PAST_DUE }),
      });
      expect(auditService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if subscription not found', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValue(null);
      await expect(service.handleTrialExpiry('tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('handlePaymentSuccess', () => {
    it('should transition to ACTIVE and set new periods', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        tenantId: 'tenant-1',
        state: SubscriptionState.PAST_DUE,
      });

      mockPrismaService.subscription.update.mockResolvedValue({
        id: 'sub-1',
        tenantId: 'tenant-1',
        state: SubscriptionState.ACTIVE,
      });

      const result = await service.handlePaymentSuccess('tenant-1', 'inv-1');

      expect(result.state).toBe(SubscriptionState.ACTIVE);
      expect(prismaService.subscription.update).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        data: expect.objectContaining({
          state: SubscriptionState.ACTIVE,
          pastDueAt: null,
          suspendedAt: null,
          cancelledAt: null,
        }),
      });
      expect(auditService.log).toHaveBeenCalled();
    });
  });

  describe('handlePaymentFailure', () => {
    it('should transition from ACTIVE to PAST_DUE', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        tenantId: 'tenant-1',
        state: SubscriptionState.ACTIVE,
      });

      mockPrismaService.subscription.update.mockResolvedValue({
        id: 'sub-1',
        tenantId: 'tenant-1',
        state: SubscriptionState.PAST_DUE,
      });

      const result = await service.handlePaymentFailure('tenant-1', 'inv-1');

      expect(result.state).toBe(SubscriptionState.PAST_DUE);
      expect(prismaService.subscription.update).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        data: expect.objectContaining({ state: SubscriptionState.PAST_DUE }),
      });
    });

    it('should not transition if not ACTIVE', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        tenantId: 'tenant-1',
        state: SubscriptionState.SUSPENDED,
      });

      const result = await service.handlePaymentFailure('tenant-1', 'inv-1');

      expect(result.state).toBe(SubscriptionState.SUSPENDED);
      expect(prismaService.subscription.update).not.toHaveBeenCalled();
    });
  });
});
