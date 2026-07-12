import { Test, TestingModule } from '@nestjs/testing';
import { PlanEntitlementGuard } from './plan-entitlement.guard';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../cache/cache.service';
import { ClsService } from 'nestjs-cls';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SubscriptionState } from '@prisma/client';

describe('PlanEntitlementGuard', () => {
  let guard: PlanEntitlementGuard;
  let reflector: jest.Mocked<Reflector>;
  let prisma: jest.Mocked<PrismaService>;
  let cls: jest.Mocked<ClsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanEntitlementGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            subscription: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: ClsService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<PlanEntitlementGuard>(PlanEntitlementGuard);
    reflector = module.get(Reflector);
    prisma = module.get(PrismaService);
    cls = module.get(ClsService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if @RequireSubscription is not present', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({}),
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(prisma.subscription.findUnique).not.toHaveBeenCalled();
  });

  describe('when @RequireSubscription is present', () => {
    let mockContext: ExecutionContext;

    beforeEach(() => {
      reflector.getAllAndOverride.mockReturnValue(true);
      mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { tenantId: 'tenant-123' },
          }),
        }),
      } as unknown as ExecutionContext;
    });

    it('should throw ForbiddenException if tenantId is missing', async () => {
      cls.get.mockReturnValue(undefined);
      const invalidContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ user: {} }), // No tenantId
        }),
      } as unknown as ExecutionContext;

      await expect(guard.canActivate(invalidContext)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(invalidContext)).rejects.toThrow(
        'Subscription context missing.',
      );
    });

    it('should fall back to request user tenantId if CLS tenantId is missing', async () => {
      cls.get.mockReturnValue(undefined);
      (prisma.subscription.findUnique as jest.Mock).mockResolvedValue({
        state: SubscriptionState.ACTIVE,
      });

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
      expect(prisma.subscription.findUnique).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-123' },
        select: { state: true },
      });
    });

    it('should throw ForbiddenException if subscription does not exist', async () => {
      cls.get.mockReturnValue('tenant-123');
      (prisma.subscription.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        'Subscription expired. Please upgrade or renew your plan.',
      );
    });

    it('should allow access if state is ACTIVE', async () => {
      cls.get.mockReturnValue('tenant-123');
      (prisma.subscription.findUnique as jest.Mock).mockResolvedValue({
        state: SubscriptionState.ACTIVE,
      });

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should allow access if state is TRIAL', async () => {
      cls.get.mockReturnValue('tenant-123');
      (prisma.subscription.findUnique as jest.Mock).mockResolvedValue({
        state: SubscriptionState.TRIAL,
      });

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should allow access if state is PAST_DUE', async () => {
      cls.get.mockReturnValue('tenant-123');
      (prisma.subscription.findUnique as jest.Mock).mockResolvedValue({
        state: SubscriptionState.PAST_DUE,
      });

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException if state is SUSPENDED', async () => {
      cls.get.mockReturnValue('tenant-123');
      (prisma.subscription.findUnique as jest.Mock).mockResolvedValue({
        state: SubscriptionState.SUSPENDED,
      });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        'Subscription expired. Please upgrade or renew your plan.',
      );
    });

    it('should throw ForbiddenException if state is CANCELLED', async () => {
      cls.get.mockReturnValue('tenant-123');
      (prisma.subscription.findUnique as jest.Mock).mockResolvedValue({
        state: SubscriptionState.CANCELLED,
      });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        'Subscription expired. Please upgrade or renew your plan.',
      );
    });
  });
});
