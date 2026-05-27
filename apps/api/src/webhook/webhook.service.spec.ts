import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { ConfigService } from '@nestjs/config';
import { WHATSAPP_PROVIDER } from '../whatsapp/interfaces/whatsapp-provider.interface';
import { getQueueToken } from '@nestjs/bullmq';
import { RedisService } from '../common/redis/redis.service';
import { AuditService } from '../common/audit/audit.service';

describe('WebhookService - Duplicate Webhook Idempotency & Takeover Logic', () => {
  let webhookService: WebhookService;
  let mockRedisService: any;
  let mockQueue: any;
  let mockPrismaService: any;
  let mockWhatsappProvider: any;

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

    mockWhatsappProvider = {
      validateWebhookSignature: jest.fn().mockReturnValue(true),
    };

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
      del: jest.fn(),
      exists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
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

    const res = await webhookService.handleFonnteIncomingMessage(
      payload,
      'secret',
    );
    expect(res.success).toBe(true);
    expect(res).not.toHaveProperty('duplicated');
  });

  it('should ignore webhook if payload is a duplicate (idempotency)', async () => {
    const payload = {
      device: '123',
      sender: '628999',
      message: 'Hi',
      id: 'msg-dupe',
    };

    mockRedisService.setNx.mockResolvedValue(false);

    const result = await webhookService.handleFonnteIncomingMessage(
      payload,
      'sig',
    );

    expect(result.success).toBe(true);
    expect((result as any).duplicated).toBe(true);
    expect(mockQueue.add).not.toHaveBeenCalled();
  });

  it('should process webhook but flag isHumanTakeoverActive if redis key exists', async () => {
    const payload = {
      device: '123',
      sender: '628999',
      message: 'Hi',
      id: 'msg-id',
    };

    mockRedisService.setNx.mockResolvedValue(true);
    mockRedisService.get.mockImplementation(async (key: string) => {
      if (key === 'wa-session:device:123')
        return JSON.stringify({ tenantId: 'tenant-1' });
      if (key === 'tenant:tenant-1:customerPhone:628999:takeover') return '1';
      return null;
    });

    const result = await webhookService.handleFonnteIncomingMessage(
      payload,
      'sig',
    );

    expect(result.success).toBe(true);
    expect(mockQueue.add).toHaveBeenCalledWith(
      'process-message',
      expect.objectContaining({
        payload: expect.objectContaining({
          isHumanTakeoverActive: true,
        }),
      }),
      expect.any(Object),
    );
  });
});
