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
    it('should return true if usedQuota is less than totalQuota + graceBuffer', async () => {
      jest.spyOn(prismaService.tokenQuota, 'findUnique').mockResolvedValue({
        id: '1',
        tenantId: 'tenant-1',
        totalQuota: 1000,
        usedQuota: 500,
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

    it('should return false if usedQuota is equal to or greater than totalQuota + graceBuffer', async () => {
      jest.spyOn(prismaService.tokenQuota, 'findUnique').mockResolvedValue({
        id: '1',
        tenantId: 'tenant-1',
        totalQuota: 1000,
        usedQuota: 1050,
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
      const updateSpy = jest
        .spyOn(prismaService.tokenQuota, 'update')
        .mockResolvedValue({
          id: '1',
          tenantId: 'tenant-1',
          totalQuota: 1000,
          usedQuota: 800,
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
          lastSyncAt: expect.any(Date),
        },
      });
      expect(emitSpy).toHaveBeenCalledWith('quota.warning.80', {
        tenantId: 'tenant-1',
        usedQuota: 800,
        totalQuota: 1000,
      });
    });

    it('should correctly increment the used quota and emit 95% warning', async () => {
      const updateSpy = jest
        .spyOn(prismaService.tokenQuota, 'update')
        .mockResolvedValue({
          id: '1',
          tenantId: 'tenant-1',
          totalQuota: 1000,
          usedQuota: 950,
          graceBuffer: 50,
          periodStart: new Date(),
          periodEnd: new Date(),
          warned70At: null,
          warned85At: new Date(), // Already warned 80%
          warned95At: null,
          lastSyncAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      const emitSpy = jest.spyOn(eventEmitter, 'emit');

      await service.incrementUsage('tenant-1', 10);

      expect(emitSpy).toHaveBeenCalledWith('quota.warning.95', {
        tenantId: 'tenant-1',
        usedQuota: 950,
        totalQuota: 1000,
      });
    });

    it('should not emit warning if thresholds are not met', async () => {
      jest
        .spyOn(prismaService.tokenQuota, 'update')
        .mockResolvedValue({
          id: '1',
          tenantId: 'tenant-1',
          totalQuota: 1000,
          usedQuota: 500,
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

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should default to incrementing by 1 if messagesUsed is not provided', async () => {
      const updateSpy = jest
        .spyOn(prismaService.tokenQuota, 'update')
        .mockResolvedValue({
          id: '1',
          tenantId: 'tenant-1',
          totalQuota: 1000,
          usedQuota: 1,
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
          lastSyncAt: expect.any(Date),
        },
      });
    });
  });
});
