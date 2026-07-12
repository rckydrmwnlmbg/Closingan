import { RedisService } from '../../../common/redis/redis.service';
import { Test, TestingModule } from '@nestjs/testing';
import { HotLeadService } from '../hot-lead.service';
import { OpenAiService } from '../../../ai/openai.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';
import { CacheService } from '../../../common/cache/cache.service';
import { HeatTier } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

describe('HotLeadService', () => {
  let service: HotLeadService;
  let openaiService: jest.Mocked<OpenAiService>;
  let prismaService: jest.Mocked<PrismaService>;
  let mockQueue: Record<string, jest.Mock>;
  let clsService: jest.Mocked<ClsService>;

  beforeEach(async () => {
    openaiService = {
      analyzeLead: jest.fn(),
    } as unknown as jest.Mocked<OpenAiService>;

    prismaService = {
      lead: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      message: {
        findMany: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    mockQueue = {
      add: jest.fn(),
    };

    clsService = {
      get: jest.fn(),
      set: jest.fn(),
    } as unknown as jest.Mocked<ClsService>;

    const mockRedisService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      delPattern: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HotLeadService,
        { provide: 'AI_PROVIDER', useValue: openaiService },
        { provide: PrismaService, useValue: prismaService },
        { provide: getQueueToken('hot-lead'), useValue: mockQueue },
        { provide: ClsService, useValue: clsService },
        { provide: RedisService, useValue: mockRedisService },
        {
          provide: CacheService,
          useValue: { 
            get: jest.fn(), 
            set: jest.fn(),
            invalidate: jest.fn(),
            invalidatePattern: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HotLeadService>(HotLeadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('shouldAnalyzeMessage', () => {
    it('should ignore short generic messages', () => {
      expect(service.shouldAnalyzeMessage('ok')).toBe(false);
      expect(service.shouldAnalyzeMessage('iya')).toBe(false);
      expect(service.shouldAnalyzeMessage('siap')).toBe(false);
    });

    it('should process messages with intent keywords', () => {
      expect(service.shouldAnalyzeMessage('berapa harganya?')).toBe(true);
      expect(service.shouldAnalyzeMessage('test drive bisa?')).toBe(true);
      expect(service.shouldAnalyzeMessage('kapan ready?')).toBe(true);
    });

    it('should process messages containing numbers (potential prices/DPs)', () => {
      expect(service.shouldAnalyzeMessage('kalau 1500000 bisa?')).toBe(true);
      // But ignore short numbers less than 4 digits unless keyword present
      expect(service.shouldAnalyzeMessage('123')).toBe(false);
    });
  });

  describe('analyzeLead', () => {
    it('should analyze lead and handle Zod validation successfully', async () => {
      // Mock data
      (prismaService.lead.findFirst as jest.Mock).mockResolvedValue({
        id: 'lead-1',
        tenantId: 'tenant-1',
        conversationId: 'conv-1',
        heatTier: HeatTier.LOW,
      });
      (prismaService.message.findMany as jest.Mock).mockResolvedValue([
        { senderType: 'CUSTOMER', content: 'berapa harga otr?' },
      ]);

      openaiService.analyzeLead.mockResolvedValue({
        result: {
          heat_tier: 'HOT',
          heat_score: 85,
          heat_reasons: ['Tanya harga'],
        },
        tokensUsed: 10,
      });

      (prismaService.lead.update as jest.Mock).mockResolvedValue({
        id: 'lead-1',
        conversationId: 'conv-1',
        heatTier: HeatTier.HOT,
        heatScore: 85,
        heatReasons: ['Tanya harga'],
        lastAlertSentAt: null,
      });

      clsService.get.mockReturnValue('tenant-1');
      await service.analyzeLead('conv-1', 'berapa harga otr?');

      expect(openaiService.analyzeLead as jest.Mock).toHaveBeenCalled();
      expect(prismaService.lead.update as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'lead-1' },
          data: expect.objectContaining({ heatTier: 'HOT' }),
        }),
      );
      expect(mockQueue.add).toHaveBeenCalledWith(
        'process-hot-lead',
        expect.any(Object),
      );
    });

    it('should abort if JSON validation fails', async () => {
      (prismaService.lead.findFirst as jest.Mock).mockResolvedValue({
        id: 'lead-1',
        tenantId: 'tenant-1',
        conversationId: 'conv-1',
      });
      (prismaService.message.findMany as jest.Mock).mockResolvedValue([
        { senderType: 'CUSTOMER', content: 'berapa harga otr?' },
      ]);

      // OpenAI returns invalid schema (missing heat_reasons)
      openaiService.analyzeLead.mockResolvedValue({
        result: {
          heat_tier: 'HOT',
          heat_score: 85,
        },
        tokensUsed: 10,
      });

      clsService.get.mockReturnValue('tenant-1');
      await service.analyzeLead('conv-1', 'berapa harga otr?');

      // Update should not be called due to schema validation failure
      expect(prismaService.lead.update as jest.Mock).not.toHaveBeenCalled();
    });

    it('should strictly observe idempotency/anti-spam rules', async () => {
      // Current lead is already HOT and sent alert 5 minutes ago
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
      (prismaService.lead.findFirst as jest.Mock).mockResolvedValue({
        id: 'lead-1',
        tenantId: 'tenant-1',
        conversationId: 'conv-1',
        heatTier: HeatTier.HOT,
        lastAlertSentAt: fiveMinsAgo,
      });
      (prismaService.message.findMany as jest.Mock).mockResolvedValue([
        { senderType: 'CUSTOMER', content: 'ada diskon?' },
      ]);

      openaiService.analyzeLead.mockResolvedValue({
        result: {
          heat_tier: 'HOT',
          heat_score: 88,
          heat_reasons: ['Tanya diskon'],
        },
        tokensUsed: 10,
      });

      // Still HOT
      (prismaService.lead.update as jest.Mock).mockResolvedValue({
        id: 'lead-1',
        conversationId: 'conv-1',
        heatTier: HeatTier.HOT,
        heatScore: 88,
        heatReasons: ['Tanya diskon'],
        lastAlertSentAt: fiveMinsAgo,
      });

      clsService.get.mockReturnValue('tenant-1');
      await service.analyzeLead('conv-1', 'ada diskon?');

      // Queue should NOT be triggered due to 30 min cooldown
      expect(mockQueue.add).not.toHaveBeenCalled();
    });
  });
});
