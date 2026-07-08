import { Test, TestingModule } from '@nestjs/testing';
import { ConversationService } from '../conversation.service';
import { ConversationRepository } from '../conversation.repository';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuditService } from '../../../common/audit/audit.service';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../../common/redis/redis.service';
import { WHATSAPP_PROVIDER } from '../../../whatsapp/interfaces/whatsapp-provider.interface';

describe('ConversationService', () => {
  let service: ConversationService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        {
          provide: ConversationRepository,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: {
            conversation: {
              findFirst: jest.fn(),
            },
            message: {
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: AuditService,
          useValue: {},
        },
        {
          provide: 'AI_PROVIDER',
          useValue: {},
        },
        {
          provide: WHATSAPP_PROVIDER,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: RedisService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ConversationService>(ConversationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getMessagesByPhone', () => {
    it('should throw if conversation not found', async () => {
      (prisma.conversation.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(
        service.getMessagesByPhone('tenant-1', '081234567890'),
      ).rejects.toThrow('Percakapan tidak ditemukan.');
    });

    it('should return messages if conversation exists', async () => {
      (prisma.conversation.findFirst as jest.Mock).mockResolvedValue({
        id: 'conv-1',
      });
      (prisma.message.findMany as jest.Mock).mockResolvedValue([
        { id: 'msg-1' },
      ]);
      const result = await service.getMessagesByPhone('tenant-1', '123');
      expect(prisma.conversation.findFirst).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', customerPhone: '123' },
        select: { id: true },
      });
      expect(prisma.message.findMany).toHaveBeenCalled();
      expect(result.data).toEqual([{ id: 'msg-1' }]);
    });
  });
});
