import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { ConfigService } from '@nestjs/config';
import { WHATSAPP_PROVIDER } from '../whatsapp/interfaces/whatsapp-provider.interface';
import { getQueueToken } from '@nestjs/bullmq';
import { RedisService } from '../common/redis/redis.service';
import { AuditService } from '../common/audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UnauthorizedException } from '@nestjs/common';
import { MessageIngestionService } from './ingestion/message-ingestion.service';
import { CacheService } from '../common/cache/cache.service';

describe('Security Phase 3 Unit Tests - Webhook Routing Isolation', () => {
  let webhookService: WebhookService;
  let mockRedisService: Record<string, jest.Mock>;
  let mockQueue: Record<string, jest.Mock>;
  let mockPrismaService: Record<string, Record<string, jest.Mock>>;
  let mockWhatsappProvider: Record<string, jest.Mock>;

  beforeEach(async () => {
    // Reset mocks for each test
    mockPrismaService = {
      whatsappSession: {
        findFirst: jest.fn(),
      },
    };

    const mockClsService = {
      set: jest.fn(),
    };

    mockWhatsappProvider = {};

    mockQueue = {
      add: jest.fn(),
    };

    const mockAuditService = {
      log: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('localhost'),
    };

    mockRedisService = {
      get: jest.fn(),
      set: jest.fn(),
      setNx: jest.fn().mockResolvedValue(true),
      delPattern: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
    };

    const mockMessageIngestionService = {
      processIncomingMessage: jest.fn().mockResolvedValue({ id: 'msg-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        WebhookService,
        { provide: WHATSAPP_PROVIDER, useValue: mockWhatsappProvider },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ClsService, useValue: mockClsService },
        { provide: getQueueToken('ai-reply'), useValue: mockQueue },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: RedisService, useValue: mockRedisService },
        {
          provide: MessageIngestionService,
          useValue: mockMessageIngestionService,
        },
        {
          provide: CacheService,
          useValue: { get: jest.fn(), set: jest.fn(), invalidate: jest.fn(), invalidatePattern: jest.fn() },
        },
      ],
    }).compile();

    webhookService = module.get<WebhookService>(WebhookService);
  });

  describe('Webhook Routing Isolation', () => {
    it('should reject forged webhook payload where device is unknown (missing tenant context)', async () => {
      // Simulate that the session doesn't exist
      mockPrismaService.whatsappSession.findFirst.mockResolvedValue(null);
      mockRedisService.get.mockResolvedValue(null); // No cache

      const payload = {
        device: 'UNKNOWN_DEVICE_123',
        sender: '628999',
        message: 'Hi',
        id: 'msg-forged',
      };

      await expect(
        webhookService.handleFonnteIncomingMessage(payload),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockQueue.add).not.toHaveBeenCalled();
    });
  });
});
