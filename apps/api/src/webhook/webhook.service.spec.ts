import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { ConfigService } from '@nestjs/config';
import { WHATSAPP_PROVIDER } from '../whatsapp/interfaces/whatsapp-provider.interface';
import { getQueueToken } from '@nestjs/bullmq';
import { RedisService } from '../common/redis/redis.service';

describe('WebhookService - Duplicate Webhook Idempotency', () => {
  let webhookService: WebhookService;
  let mockRedisService: any;

  beforeEach(async () => {
    const mockPrismaService = {
      whatsappSession: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ tenantId: 'tenant-1', phoneNumber: '123' }),
      },
    };

    const mockClsService = {
      set: jest.fn(),
    };

    const mockWhatsappProvider = {
      validateWebhookSignature: jest.fn().mockReturnValue(true),
    };

    const mockQueue = {
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
          provide: require('../common/audit/audit.service').AuditService,
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

    mockRedisService.setNx.mockResolvedValue(true); // NX returns true when key is set

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
      id: 'msg-1',
      sender: 'test',
      message: 'test',
    };

    mockRedisService.setNx.mockResolvedValue(false); // NX returns false when key exists

    const res = await webhookService.handleFonnteIncomingMessage(
      payload,
      'secret',
    );
    expect(res.success).toBe(true);
    expect(res.duplicated).toBe(true);
  });
});
