import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { ConfigService } from '@nestjs/config';
import { WHATSAPP_PROVIDER } from '../whatsapp/interfaces/whatsapp-provider.interface';
import { getQueueToken } from '@nestjs/bullmq';

jest.mock('ioredis', () => {
  return {
    Redis: jest.fn().mockImplementation(() => {
      return {
        set: jest.fn(),
        disconnect: jest.fn(),
      };
    }),
  };
});

describe('WebhookService - Duplicate Webhook Idempotency', () => {
  let webhookService: WebhookService;
  let mockRedisClient: any;

  beforeEach(async () => {
    const mockPrismaService = {
      whatsappSession: {
        findFirst: jest.fn().mockResolvedValue({ tenantId: 'tenant-1', phoneNumber: '123' }),
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
      ],
    }).compile();

    webhookService = module.get<WebhookService>(WebhookService);
    mockRedisClient = (webhookService as any).redisClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process webhook if payload is new', async () => {
    const payload = { device: '123', id: 'msg-1', sender: 'test', message: 'test' };

    mockRedisClient.set.mockResolvedValue('OK'); // NX returns OK when key is set

    const res = await webhookService.handleFonnteIncomingMessage(payload as any, 'secret');
    expect(res.success).toBe(true);
    expect(res).not.toHaveProperty('duplicated');
  });

  it('should ignore webhook if payload is a duplicate (idempotency)', async () => {
    const payload = { device: '123', id: 'msg-1', sender: 'test', message: 'test' };

    mockRedisClient.set.mockResolvedValue(null); // NX returns null when key exists

    const res = await webhookService.handleFonnteIncomingMessage(payload as any, 'secret');
    expect(res.success).toBe(true);
    expect(res.duplicated).toBe(true);
  });
});
