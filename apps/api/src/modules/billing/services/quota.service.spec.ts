import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QuotaService } from './quota.service';
import { PrismaService } from '../../../common/prisma/prisma.service';

describe('QuotaService', () => {
  let service: QuotaService;
  let prismaService: PrismaService;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotaService,
        {
          provide: PrismaService,
          useValue: {
            tokenQuota: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<QuotaService>(QuotaService);
    prismaService = module.get<PrismaService>(PrismaService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkQuota', () => {
    it('should return true if usedQuota is less than totalQuota + graceBuffer + extraCredits', async () => {
      jest.spyOn(prismaService.tokenQuota, 'findUnique').mockResolvedValue({
        id: '1',
        tenantId: 'tenant-1',
        totalQuota: 1000,
        usedQuota: 500,
        extraCredits: 0,
        graceBuffer: 50,
        periodStart: new Date(),
        periodEnd: new Date(),
        warned70At: null,
        warned85At: null,
        warned95At: null,
        lastSyncAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.checkQuota('tenant-1');
      expect(result).toBe(true);
    });

    it('should return false if usedQuota is equal to or greater than totalQuota + graceBuffer + extraCredits', async () => {
      jest.spyOn(prismaService.tokenQuota, 'findUnique').mockResolvedValue({
        id: '1',
        tenantId: 'tenant-1',
        totalQuota: 1000,
        usedQuota: 1050,
        extraCredits: 0,
        graceBuffer: 50,
        periodStart: new Date(),
        periodEnd: new Date(),
        warned70At: null,
        warned85At: null,
        warned95At: null,
        lastSyncAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.checkQuota('tenant-1');
      expect(result).toBe(false);
    });

    it('should return true if extraCredits is available even if usedQuota is equal to totalQuota + graceBuffer', async () => {
      jest.spyOn(prismaService.tokenQuota, 'findUnique').mockResolvedValue({
        id: '1',
        tenantId: 'tenant-1',
        totalQuota: 1000,
        usedQuota: 1050,
        extraCredits: 10,
        graceBuffer: 50,
        periodStart: new Date(),
        periodEnd: new Date(),
        warned70At: null,
        warned85At: null,
        warned95At: null,
        lastSyncAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.checkQuota('tenant-1');
      expect(result).toBe(true);
    });

    it('should return false if TokenQuota is not found', async () => {
      jest
        .spyOn(prismaService.tokenQuota, 'findUnique')
        .mockResolvedValue(null);

      const result = await service.checkQuota('tenant-2');
      expect(result).toBe(false);
    });
  });

  describe('incrementUsage', () => {
    it('should correctly increment the used quota and emit 80% warning', async () => {
      jest.spyOn(prismaService.tokenQuota, 'findUnique').mockResolvedValue({
        id: '1',
        tenantId: 'tenant-1',
        totalQuota: 1000,
        usedQuota: 790,
        extraCredits: 0,
        graceBuffer: 50,
        periodStart: new Date(),
        periodEnd: new Date(),
        warned70At: null,
        warned85At: null,
        warned95At: null,
        lastSyncAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const updateSpy = jest
        .spyOn(prismaService.tokenQuota, 'update')
        .mockResolvedValue({
          id: '1',
          tenantId: 'tenant-1',
          totalQuota: 1000,
          usedQuota: 800,
          extraCredits: 0,
          graceBuffer: 50,
          periodStart: new Date(),
          periodEnd: new Date(),
          warned70At: null,
          warned85At: null,
          warned95At: null,
          lastSyncAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      const emitSpy = jest.spyOn(eventEmitter, 'emit');

      await service.incrementUsage('tenant-1', 10);

      expect(updateSpy).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        data: {
          usedQuota: { increment: 10 },
          extraCredits: { decrement: 0 },
          lastSyncAt: expect.any(Date),
        },
      });
      expect(emitSpy).toHaveBeenCalledWith('quota.warning.80', {
        tenantId: 'tenant-1',
        usedQuota: 800,
        totalQuota: 1000,
      });
    });

    it('should deduct from extra credits when regular quota is exhausted', async () => {
      jest.spyOn(prismaService.tokenQuota, 'findUnique').mockResolvedValue({
        id: '1',
        tenantId: 'tenant-1',
        totalQuota: 1000,
        usedQuota: 995,
        extraCredits: 20,
        graceBuffer: 50,
        periodStart: new Date(),
        periodEnd: new Date(),
        warned70At: null,
        warned85At: null,
        warned95At: null,
        lastSyncAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const updateSpy = jest
        .spyOn(prismaService.tokenQuota, 'update')
        .mockResolvedValue({
          id: '1',
          tenantId: 'tenant-1',
          totalQuota: 1000,
          usedQuota: 1000,
          extraCredits: 15,
          graceBuffer: 50,
          periodStart: new Date(),
          periodEnd: new Date(),
          warned70At: null,
          warned85At: null,
          warned95At: null,
          lastSyncAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      await service.incrementUsage('tenant-1', 10);

      // 5 to fill regular quota, 5 deducted from extraCredits
      expect(updateSpy).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        data: {
          usedQuota: { increment: 5 },
          extraCredits: { decrement: 5 },
          lastSyncAt: expect.any(Date),
        },
      });
    });

    it('should overflow to usedQuota (grace buffer) when extra credits are also exhausted', async () => {
      jest.spyOn(prismaService.tokenQuota, 'findUnique').mockResolvedValue({
        id: '1',
        tenantId: 'tenant-1',
        totalQuota: 1000,
        usedQuota: 1000, // regular exhausted
        extraCredits: 2,
        graceBuffer: 50,
        periodStart: new Date(),
        periodEnd: new Date(),
        warned70At: null,
        warned85At: null,
        warned95At: null,
        lastSyncAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const updateSpy = jest
        .spyOn(prismaService.tokenQuota, 'update')
        .mockResolvedValue({
          id: '1',
          tenantId: 'tenant-1',
          totalQuota: 1000,
          usedQuota: 1008,
          extraCredits: 0,
          graceBuffer: 50,
          periodStart: new Date(),
          periodEnd: new Date(),
          warned70At: null,
          warned85At: null,
          warned95At: null,
          lastSyncAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      await service.incrementUsage('tenant-1', 10);

      // 0 to fill regular quota, 2 deducted from extraCredits, remaining 8 added to usedQuota (overflow)
      expect(updateSpy).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        data: {
          usedQuota: { increment: 8 },
          extraCredits: { decrement: 2 },
          lastSyncAt: expect.any(Date),
        },
      });
    });

    it('should default to incrementing by 1 if messagesUsed is not provided', async () => {
      jest.spyOn(prismaService.tokenQuota, 'findUnique').mockResolvedValue({
        id: '1',
        tenantId: 'tenant-1',
        totalQuota: 1000,
        usedQuota: 0,
        extraCredits: 0,
        graceBuffer: 50,
        periodStart: new Date(),
        periodEnd: new Date(),
        warned70At: null,
        warned85At: null,
        warned95At: null,
        lastSyncAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const updateSpy = jest
        .spyOn(prismaService.tokenQuota, 'update')
        .mockResolvedValue({
          id: '1',
          tenantId: 'tenant-1',
          totalQuota: 1000,
          usedQuota: 1,
          extraCredits: 0,
          graceBuffer: 50,
          periodStart: new Date(),
          periodEnd: new Date(),
          warned70At: null,
          warned85At: null,
          warned95At: null,
          lastSyncAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      await service.incrementUsage('tenant-1');

      expect(updateSpy).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        data: {
          usedQuota: { increment: 1 },
          extraCredits: { decrement: 0 },
          lastSyncAt: expect.any(Date),
        },
      });
    });
  });

  describe('addExtraCredits', () => {
    it('should add extra credits successfully', async () => {
      const updateSpy = jest
        .spyOn(prismaService.tokenQuota, 'update')
        .mockResolvedValue({} as any);

      await service.addExtraCredits('tenant-1', 100);

      expect(updateSpy).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        data: {
          extraCredits: { increment: 100 },
          lastSyncAt: expect.any(Date),
        },
      });
    });

    it('should throw error if amount is less than or equal to 0', async () => {
      await expect(service.addExtraCredits('tenant-1', 0)).rejects.toThrow(
        'Amount must be positive to add extra credits',
      );
      await expect(service.addExtraCredits('tenant-1', -10)).rejects.toThrow(
        'Amount must be positive to add extra credits',
      );
    });
  });
});
