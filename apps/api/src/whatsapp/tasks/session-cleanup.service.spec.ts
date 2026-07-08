import { Test, TestingModule } from '@nestjs/testing';
import { SessionCleanupService } from './session-cleanup.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('SessionCleanupService', () => {
  let sessionCleanupService: SessionCleanupService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const mockPrismaService = {
      whatsappSession: {
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionCleanupService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    sessionCleanupService = module.get<SessionCleanupService>(
      SessionCleanupService,
    );
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should call prisma updateMany to clear expired QR codes', async () => {
    await sessionCleanupService.cleanupStaleSessions();

    expect(
      prismaService.whatsappSession.updateMany as jest.Mock,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          qrExpiresAt: expect.objectContaining({
            lt: expect.any(Date),
          }),
          qrCode: {
            not: null,
          },
        }),
        data: {
          qrCode: null,
          qrExpiresAt: null,
          state: 'DISCONNECTED',
        },
      }),
    );
  });
});
