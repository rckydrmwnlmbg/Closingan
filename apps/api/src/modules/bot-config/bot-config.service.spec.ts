import { Test, TestingModule } from '@nestjs/testing';
import { BotConfigService } from './bot-config.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('BotConfigService', () => {
  let service: BotConfigService;
  let prisma: PrismaService;

  const mockPrisma = {
    botConfig: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BotConfigService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BotConfigService>(BotConfigService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBotConfig', () => {
    it('should return bot config if found', async () => {
      const mockConfig = { id: '1', tenantId: 't1', systemPrompt: 'test' };
      mockPrisma.botConfig.findUnique.mockResolvedValue(mockConfig);

      const result = await service.getBotConfig('t1');
      expect(result).toEqual(mockConfig);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.botConfig.findUnique.mockResolvedValue(null);

      await expect(service.getBotConfig('t1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('upsertBotConfig', () => {
    it('should upsert bot config if tenant exists', async () => {
      const mockDto = {
        systemPrompt: 'prompt',
        greetingMessage: 'hello',
      };
      mockPrisma.tenant.findUnique.mockResolvedValue({ id: 't1' });
      const mockResult = {
        ...mockDto,
        id: '1',
        tenantId: 't1',
        businessContext: '',
      };
      mockPrisma.botConfig.upsert.mockResolvedValue(mockResult);

      const result = await service.upsertBotConfig('t1', mockDto);

      expect(result).toEqual(mockResult);
      expect(mockPrisma.botConfig.upsert).toHaveBeenCalledWith({
        where: { tenantId: 't1' },
        update: { ...mockDto, businessContext: '' },
        create: { ...mockDto, tenantId: 't1', businessContext: '' },
      });
    });

    it('should throw NotFoundException if tenant does not exist', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null);

      await expect(
        service.upsertBotConfig('invalid', {
          systemPrompt: '1',
          greetingMessage: '2',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
