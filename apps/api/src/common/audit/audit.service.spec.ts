/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClsService } from 'nestjs-cls';

describe('AuditService', () => {
  let service: AuditService;
  let prisma: PrismaService;
  let cls: ClsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: PrismaService,
          useValue: {
            auditLog: {
              create: jest.fn().mockResolvedValue(true),
            },
          },
        },
        {
          provide: ClsService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'tenantId') return 'tenant-context-123';
              if (key === 'userId') return 'user-context-456';
              if (key === 'ipAddress') return '127.0.0.1';
              if (key === 'userAgent') return 'jest-test';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    prisma = module.get<PrismaService>(PrismaService);
    cls = module.get<ClsService>(ClsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should auto-inject missing properties from ClsService', async () => {
    await service.log({
      action: 'USER_LOGIN',
      // Leaving out tenantId, userId, ipAddress, userAgent intentionally
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: 'tenant-context-123',
        userId: 'user-context-456',
        ipAddress: '127.0.0.1',
        userAgent: 'jest-test',
        action: 'USER_LOGIN',
      }),
    });
  });

  it('should prioritize payload properties over ClsService context', async () => {
    await service.log({
      action: 'USER_LOGIN',
      tenantId: 'tenant-payload-999',
      userId: 'user-payload-999',
      ipAddress: '8.8.8.8',
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: 'tenant-payload-999',
        userId: 'user-payload-999',
        ipAddress: '8.8.8.8',
        userAgent: 'jest-test', // Should still fallback to cls since not in payload
        action: 'USER_LOGIN',
      }),
    });
  });

  it('should abort logging gracefully if no tenantId is available anywhere', async () => {
    jest.spyOn(cls, 'get').mockReturnValue(null);

    await service.log({ action: 'USER_LOGIN' });

    expect(prisma.auditLog.create).not.toHaveBeenCalled();
  });
});
