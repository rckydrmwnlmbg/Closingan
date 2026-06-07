import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { AuditAction } from '@prisma/client';
import { Logger } from '@nestjs/common';

describe('AuditService', () => {
  let service: AuditService;
  let prismaService: jest.Mocked<PrismaService>;
  let clsService: jest.Mocked<ClsService>;

  beforeEach(async () => {
    const mockPrismaService = {
      auditLog: {
        create: jest.fn(),
      },
    };

    const mockClsService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ClsService, useValue: mockClsService },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    prismaService = module.get(PrismaService);
    clsService = module.get(ClsService);

    // Silence logger during tests
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an audit log using explicit tenantId and userId', async () => {
    const payload = {
      tenantId: 'tenant-123',
      userId: 'user-456',
      action: AuditAction.USER_LOGIN,
    };

    await service.log(payload);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(prismaService.auditLog.create).toHaveBeenCalledWith({
      data: {
        tenantId: 'tenant-123',
        userId: 'user-456',
        action: AuditAction.USER_LOGIN,
        entityType: undefined,
        entityId: undefined,
        metadata: undefined,
        ipAddress: undefined,
        userAgent: undefined,
      },
    });

    // Should not call clsService if explicitly provided
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(clsService.get).not.toHaveBeenCalled();
  });

  it('should fallback to ClsService if tenantId and userId are missing in payload', async () => {
    const payload = {
      action: AuditAction.USER_LOGIN,
    };

    clsService.get.mockImplementation((key) => {
      if (key === 'tenantId') return 'cls-tenant-789';
      if (key === 'user') return { id: 'cls-user-101' };
      return null;
    });

    await service.log(payload);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(clsService.get).toHaveBeenCalledWith('tenantId');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(clsService.get).toHaveBeenCalledWith('user');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(prismaService.auditLog.create).toHaveBeenCalledWith({
      data: {
        tenantId: 'cls-tenant-789',
        userId: 'cls-user-101',
        action: AuditAction.USER_LOGIN,
        entityType: undefined,
        entityId: undefined,
        metadata: undefined,
        ipAddress: undefined,
        userAgent: undefined,
      },
    });
  });

  it('should not create an audit log and emit a warning if tenantId is missing', async () => {
    const payload = {
      action: AuditAction.USER_LOGIN,
    };

    clsService.get.mockReturnValue(null);
    const warnSpy = jest.spyOn(Logger.prototype, 'warn');

    await service.log(payload);

    expect(warnSpy).toHaveBeenCalledWith(
      `Attempted to create audit log without tenantId for action: ${payload.action as string}`,
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(prismaService.auditLog.create).not.toHaveBeenCalled();
  });

  it('should handle database errors gracefully without throwing', async () => {
    const payload = {
      tenantId: 'tenant-123',
      action: AuditAction.USER_LOGIN,
    };

    const error = new Error('Database connection failed');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const createMock = prismaService.auditLog.create as jest.Mock;
    createMock.mockRejectedValue(error);
    const errorSpy = jest.spyOn(Logger.prototype, 'error');

    // Should not throw
    await expect(service.log(payload)).resolves.not.toThrow();

    expect(errorSpy).toHaveBeenCalledWith(
      `Failed to create audit log: ${error.message}`,
      error.stack,
    );
  });

  it('should properly pass metadata if provided', async () => {
    const payload = {
      tenantId: 'tenant-123',
      action: AuditAction.USER_LOGIN,
      metadata: { browser: 'Chrome', version: 100 },
    };

    await service.log(payload);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(prismaService.auditLog.create).toHaveBeenCalledWith({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: expect.objectContaining({
        metadata: { browser: 'Chrome', version: 100 },
      }),
    });
  });
});
