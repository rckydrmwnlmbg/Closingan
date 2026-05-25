import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { ConfigService } from '@nestjs/config';
import { WHATSAPP_PROVIDER } from '../whatsapp/interfaces/whatsapp-provider.interface';
import { UnauthorizedException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { RedisService } from '../common/redis/redis.service';

describe('Security Phase 3 Unit Tests - Webhook Routing Isolation', () => {
  let webhookService: WebhookService;

  beforeEach(async () => {
    const mockPrismaService = {
      whatsappSession: {
        findFirst: jest.fn().mockResolvedValue(null), // Simulate forged payload
      },
      auditLog: {
        create: jest.fn(),
      },
    };

    const mockClsService = {
      run: jest.fn().mockImplementation((cb) => cb()),
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
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('localhost') },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            setNx: jest.fn(),
          },
        },
      ],
    }).compile();

    webhookService = module.get<WebhookService>(WebhookService);
  });

  describe('Webhook Routing Isolation', () => {
    it('should reject forged webhook payload where device is unknown (missing tenant context)', async () => {
      // Simulate Fonnte payload
      const payload = {
        device: 'unknown-device-123',
        sender: '12345',
        message: 'Hello',
        id: 'msg-1',
      };

      await expect(
        webhookService.handleFonnteIncomingMessage(payload as any, 'secret'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
