import { Test, TestingModule } from '@nestjs/testing';
import { ConversationService } from '../conversation.service';
import { ConversationRepository } from '../conversation.repository';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuditService } from '../../../common/audit/audit.service';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../../common/redis/redis.service';
import { WHATSAPP_PROVIDER } from '../../../whatsapp/interfaces/whatsapp-provider.interface';

describe('Human Takeover Rule', () => {
  let service: ConversationService;
  let prisma: PrismaService;
  let audit: AuditService;
  let whatsappProvider: any;

  let redis: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        {
          provide: ConversationRepository,
          useValue: {
            findConversations: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            conversation: {
              findFirst: jest.fn(),
              update: jest.fn(),
            },
            message: {
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: AuditService,
          useValue: {
            log: jest.fn(),
          },
        },
        {
          provide: 'AI_PROVIDER',
          useValue: {},
        },
        {
          provide: WHATSAPP_PROVIDER,
          useValue: {
            sendMessage: jest.fn().mockResolvedValue({ success: true }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(15), // 15 mins cooldown
          },
        },

        {
          provide: RedisService,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
            delPattern: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConversationService>(ConversationService);
    prisma = module.get<PrismaService>(PrismaService);
    audit = module.get<AuditService>(AuditService);
    whatsappProvider = module.get(WHATSAPP_PROVIDER);

    redis = module.get<RedisService>(RedisService);
  });

  it('should pause AI automatically when sales replies manually (Human Takeover)', async () => {
    const mockConversation = {
      id: 'conv-1',
      tenantId: 'tenant-1',
      aiMode: 'AUTO_REPLY',
      state: 'OPEN',
      aiModePausedUntil: null,
      customerPhone: '123456789',
    };

    (prisma.conversation.findFirst as jest.Mock).mockResolvedValue(
      mockConversation,
    );
    (prisma.conversation.update as jest.Mock).mockResolvedValue({
      ...mockConversation,
      state: 'HUMAN_ACTIVE',
    });
    (prisma.message.create as jest.Mock).mockResolvedValue({
      id: 'msg-1',
      content: 'hello from human',
    });

    await service.sendMessageManual('tenant-1', 'conv-1', 'hello from human');

    // Should update conversation state and set pause cooldown
    expect(prisma.conversation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'conv-1' },
        data: expect.objectContaining({
          state: 'HUMAN_ACTIVE',
          aiModePausedUntil: expect.any(Date),
        }),
      }),
    );

    // Should create seller message
    expect(prisma.message.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          senderType: 'SELLER',
          content: 'hello from human',
        }),
      }),
    );

    // Should set the Redis takeover flag
    expect(redis.set).toHaveBeenCalledWith(
      'tenant:tenant-1:customerPhone:123456789:takeover',
      '1',
      15 * 60,
    );

    // Should log the AI_MODE_CHANGED / takeover
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'AI_MODE_CHANGED',
        metadata: expect.objectContaining({
          step: 'HUMAN_TAKEOVER',
        }),
      }),
    );

    // Should send the WhatsApp message
    expect(whatsappProvider.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'hello from human',
      }),
    );
  });

  it('should not throw if conversation is not AI active, just send message', async () => {
    const mockConversation = {
      id: 'conv-1',
      tenantId: 'tenant-1',
      aiMode: 'AI_OFF',
      state: 'OPEN',
      aiModePausedUntil: null,
      customerPhone: '123456789',
    };

    (prisma.conversation.findFirst as jest.Mock).mockResolvedValue(
      mockConversation,
    );
    (prisma.conversation.update as jest.Mock).mockResolvedValue({
      ...mockConversation,
      state: 'OPEN',
    });
    (prisma.message.create as jest.Mock).mockResolvedValue({
      id: 'msg-1',
      content: 'hello',
    });

    await service.sendMessageManual('tenant-1', 'conv-1', 'hello');

    // Should not pause AI or set HUMAN_ACTIVE
    expect(prisma.conversation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          state: 'OPEN',
          aiModePausedUntil: null,
        }),
      }),
    );

    // Should not log audit for takeover
    expect(audit.log).not.toHaveBeenCalled();

    // Should send message
    expect(whatsappProvider.sendMessage).toHaveBeenCalled();
  });
});
