import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { ConfigService } from '@nestjs/config';
import { WHATSAPP_PROVIDER } from '../whatsapp/interfaces/whatsapp-provider.interface';
import { getQueueToken } from '@nestjs/bullmq';
import { RedisService } from '../common/redis/redis.service';
import { CacheService } from '../common/cache/cache.service';
import { AuditService } from '../common/audit/audit.service';
import { MessageIngestionService } from './ingestion/message-ingestion.service';

describe('WebhookService - Duplicate Webhook Idempotency & Takeover Logic', () => {
  let webhookService: WebhookService;
  let mockRedisService: Record<string, jest.Mock>;
  let mockQueue: Record<string, jest.Mock>;
  let mockPrismaService: Record<string, Record<string, jest.Mock>>;
  let mockWhatsappProvider: Record<string, jest.Mock>;
  let mockMessageIngestionService: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockPrismaService = {
      whatsappSession: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ tenantId: 'tenant-1', phoneNumber: '123' }),
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
      setNx: jest.fn(),
      delPattern: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
    };

    mockMessageIngestionService = {
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process webhook if payload is new', async () => {
    const payload = {
      device: '123',
      id: 'msg-1',
      sender: 'test',
      message: 'test',
    };

    mockRedisService.setNx.mockResolvedValue(true);

    const res = await webhookService.handleFonnteIncomingMessage(payload);
    expect(res.success).toBe(true);
    expect(res).not.toHaveProperty('duplicated');
    expect(
      mockMessageIngestionService.processIncomingMessage,
    ).toHaveBeenCalled();
  });

  it('should ignore webhook if payload is a duplicate (idempotency)', async () => {
    const payload = {
      device: '123',
      sender: '628999',
      message: 'Hi',
      id: 'msg-dupe',
    };

    mockRedisService.setNx.mockResolvedValue(false);

    const result = await webhookService.handleFonnteIncomingMessage(payload);

    expect(result.success).toBe(true);
    expect((result as { duplicated?: boolean }).duplicated).toBe(true);
    expect(mockQueue.add).not.toHaveBeenCalled();
    expect(
      mockMessageIngestionService.processIncomingMessage,
    ).not.toHaveBeenCalled();
  });

  it('should detect outgoing message, set manual_override flag', async () => {
    const payload = {
      device: '628999',
      sender: '628999',
      to: '123456',
      message: 'Outgoing reply',
      id: 'msg-out',
    };

    mockRedisService.setNx.mockResolvedValue(true);

    const result = await webhookService.handleFonnteIncomingMessage(payload);

    expect(result.success).toBe(true);
    // Should set manual_override:123456
    expect(mockRedisService.set).toHaveBeenCalledWith(
      'manual_override:123456',
      '1',
      120,
    );
    // Queue logic is currently disabled in the webhook service
    // expect(mockQueue.add).toHaveBeenCalledWith(
    //   'process-message',
    //   expect.any(Object),
    //   expect.objectContaining({ delay: 0 }),
    // );
  });
});
