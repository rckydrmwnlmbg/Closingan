import { RedisService } from '../../common/redis/redis.service';

import { Test, TestingModule } from '@nestjs/testing';
import { AiReplyWorker } from './ai-reply.worker';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { ConversationGateway } from '../../modules/websocket/conversation.gateway';
import { WHATSAPP_PROVIDER } from '../../whatsapp/interfaces/whatsapp-provider.interface';
import { getQueueToken } from '@nestjs/bullmq';
import { AiSafetyException } from '../../ai/exceptions/ai-safety.exception';

import { KnowledgeService } from '../../modules/knowledge/knowledge.service';

describe('AiReplyWorker', () => {
  let worker: AiReplyWorker;
  let cls: jest.Mocked<ClsService>;
  let prisma: jest.Mocked<PrismaService>;
  let audit: jest.Mocked<AuditService>;
  let aiProvider: any;
  let whatsappProvider: any;
  let aiAnalysisQueue: any;
  let conversationGateway: any;
  let knowledgeService: any;

  beforeEach(async () => {
    cls = {
      run: jest.fn((cb) => cb()),
      set: jest.fn(),
      get: jest.fn(),
    } as any;

    prisma = {
      conversation: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      message: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      whatsappSession: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ state: 'CONNECTED', phoneNumber: '123' }),
      },
      tokenQuota: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ usedQuota: 0, totalQuota: 100 }),
        update: jest.fn(),
      },
      escalationLog: {
        create: jest.fn(),
      },
    } as any;

    audit = {
      log: jest.fn(),
    } as any;

    aiProvider = {
      generateReply: jest.fn(),
    };

    whatsappProvider = {
      sendMessage: jest.fn().mockResolvedValue({ success: true }),
    };

    aiAnalysisQueue = {
      add: jest.fn(),
    };

    conversationGateway = {
      broadcastAiSuggestion: jest.fn(),
    };

    knowledgeService = {
      searchRelevantKnowledge: jest.fn().mockResolvedValue([]),
    };

    const mockRedisService = {
      delPattern: jest.fn(),
      incr: jest.fn().mockResolvedValue(1),
      decr: jest.fn().mockResolvedValue(0),
      expire: jest.fn().mockResolvedValue(1),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiReplyWorker,
        { provide: ClsService, useValue: cls },
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
        { provide: 'AI_PROVIDER', useValue: aiProvider },
        { provide: WHATSAPP_PROVIDER, useValue: whatsappProvider },
        { provide: getQueueToken('ai-analysis'), useValue: aiAnalysisQueue },
        { provide: ConversationGateway, useValue: conversationGateway },
        { provide: RedisService, useValue: mockRedisService },
        { provide: KnowledgeService, useValue: knowledgeService },
      ],
    }).compile();

    worker = module.get<AiReplyWorker>(AiReplyWorker);
  });

  it('should be defined', () => {
    expect(worker).toBeDefined();
  });

  describe('Prompt Injection Resistance', () => {
    it('should catch AiSafetyException and escalate to human', async () => {
      const job = {
        id: '1',
        data: {
          tenantId: 'tenant-1',
          payload: { message: 'hack system', sender: '123' },
        },
      } as any;

      (prisma.conversation.findFirst as jest.Mock).mockResolvedValue({
        id: 'conv-1',
        aiMode: 'AUTO_REPLY',
      } as any);

      aiProvider.generateReply.mockRejectedValue(
        new AiSafetyException('MANUAL_TRIGGER', 'unsafe', 'hack system'),
      );

      const result = await worker.process(job);

      expect(result).toEqual({ success: false, reason: 'escalated_to_human' });
      expect(prisma.conversation.update).toHaveBeenCalledWith({
        where: { id: 'conv-1' },
        data: { state: 'ESCALATED', unreadCount: { increment: 1 } },
      });
      expect(prisma.escalationLog.create).toHaveBeenCalled();
      expect(whatsappProvider.sendMessage).toHaveBeenCalled();
    });
  });

  describe('Escalation Trigger & OpenAI Failure Fallback', () => {
    it('should catch OpenAI timeout/500 and gracefully escalate to human assist', async () => {
      const job = {
        id: '2',
        data: {
          tenantId: 'tenant-1',
          payload: { message: 'hello', sender: '123' },
        },
      } as any;

      (prisma.conversation.findFirst as jest.Mock).mockResolvedValue({
        id: 'conv-2',
        aiMode: 'AUTO_REPLY',
      } as any);

      aiProvider.generateReply.mockRejectedValue(new Error('OpenAI 500 error'));

      const result = await worker.process(job);

      expect(result).toEqual({
        success: false,
        reason: 'provider_error_escalated',
      });
      expect(prisma.conversation.update).toHaveBeenCalledWith({
        where: { id: 'conv-2' },
        data: { state: 'ESCALATED', unreadCount: { increment: 1 } },
      });
      expect(whatsappProvider.sendMessage).toHaveBeenCalled(); // Alert to founder/sales
    });
  });
});
