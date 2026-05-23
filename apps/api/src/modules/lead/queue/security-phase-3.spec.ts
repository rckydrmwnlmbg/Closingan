import { Test, TestingModule } from '@nestjs/testing';
import { HotLeadProcessor } from './hot-lead.processor';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../../../mail/mail.service';
import { ConversationGateway } from '../../websocket/conversation.gateway';
import { WHATSAPP_PROVIDER } from '../../../whatsapp/interfaces/whatsapp-provider.interface';

// Mock Redis directly to prevent initialization errors
jest.mock('ioredis', () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      disconnect: jest.fn(),
      exists: jest.fn().mockResolvedValue(0),
      set: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue(null),
    })),
  };
});

describe('Security Phase 3 Unit Tests - Queue Worker Isolation', () => {
  let processor: HotLeadProcessor;
  let mockClsService: Partial<ClsService>;

  beforeEach(async () => {
    mockClsService = {
      run: jest.fn().mockImplementation(async (cb) => cb()),
      set: jest.fn(),
      get: jest.fn(),
    };

    const mockPrismaService = {
      lead: {
        findFirst: jest.fn().mockResolvedValue({ customerName: 'Test' }),
      },
      notificationPreference: { findUnique: jest.fn().mockResolvedValue(null) },
      user: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ id: 'u1', waPersonalNumber: '123' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HotLeadProcessor,
        { provide: ClsService, useValue: mockClsService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: MailService, useValue: { sendHotLeadAlert: jest.fn() } },
        {
          provide: ConversationGateway,
          useValue: { broadcastLeadHeatChanged: jest.fn() },
        },
        { provide: WHATSAPP_PROVIDER, useValue: { sendMessage: jest.fn() } },
      ],
    }).compile();

    processor = module.get<HotLeadProcessor>(HotLeadProcessor);
  });

  describe('Queue worker context injection', () => {
    it('should inject tenantId into ClsService before processing', async () => {
      const jobData = {
        tenantId: 'tenant-123',
        leadId: 'lead-1',
        conversationId: 'c1',
        heatTier: 'HOT',
        heatReasons: [],
      };
      await processor.process({ data: jobData, id: 'job-1' } as any);

      expect(mockClsService.run).toHaveBeenCalled();
      expect(mockClsService.set).toHaveBeenCalledWith('tenantId', 'tenant-123');
    });
  });
});
