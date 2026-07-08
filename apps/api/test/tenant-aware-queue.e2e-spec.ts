import { Test, TestingModule } from '@nestjs/testing';
import { DisconnectDetectionService } from '../src/whatsapp/tasks/disconnect-detection.service';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { WHATSAPP_PROVIDER } from '../src/whatsapp/interfaces/whatsapp-provider.interface';
import { getQueueToken } from '@nestjs/bullmq';
import { AuditService } from '../src/common/audit/audit.service';

describe('Tenant Aware Queue Isolation Test', () => {
  let disconnectDetectionService: DisconnectDetectionService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const mockPrismaService = {
      whatsappSession: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'session-1',
            tenantId: 'tenant-a',
            state: 'CONNECTED',
            tenant: { users: [] },
          },
          {
            id: 'session-2',
            tenantId: 'tenant-b',
            state: 'CONNECTED',
            tenant: { users: [] },
          },
        ]),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    const mockClsService = {
      run: jest.fn().mockImplementation((cb: () => unknown) => {
        return cb();
      }),
      set: jest.fn(),
    };

    const mockWhatsappProvider = {
      checkConnectionStatus: jest
        .fn()
        .mockImplementation((tenantId: string) => {
          if (tenantId === 'tenant-a')
            return Promise.resolve({ isConnected: false }); // Tenant A disconnected
          return Promise.resolve({ isConnected: true }); // Tenant B connected
        }),
    };

    const mockAuditService = {
      log: jest.fn(),
    };

    const mockQueue = {
      add: jest.fn(),
      pause: jest.fn(), // If global pause was called
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisconnectDetectionService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ClsService, useValue: mockClsService },
        { provide: WHATSAPP_PROVIDER, useValue: mockWhatsappProvider },
        { provide: getQueueToken('ai-reply'), useValue: mockQueue },
        { provide: getQueueToken('blast-campaign'), useValue: mockQueue },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    disconnectDetectionService = module.get<DisconnectDetectionService>(
      DisconnectDetectionService,
    );
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should only update state for Tenant A when Tenant A disconnects, without affecting Tenant B', async () => {
    await disconnectDetectionService.handleDisconnectDetection();

    // Tenant A should be set to RECONNECTING
    expect(
      jest.mocked(prismaService.whatsappSession.updateMany),
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['session-1'] } },
        data: expect.objectContaining({ state: 'RECONNECTING' }) as unknown,
      }),
    );

    // Tenant B should not be updated
    expect(
      jest.mocked(prismaService.whatsappSession.update),
    ).not.toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['session-2'] } },
      }),
    );
  });
});
