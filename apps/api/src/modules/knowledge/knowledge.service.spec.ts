import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeService } from './knowledge.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('KnowledgeService', () => {
  let service: KnowledgeService;

  const mockPrismaService = {
    knowledgeAsset: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<KnowledgeService>(KnowledgeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a knowledge asset', async () => {
      const mockResult = {
        id: '1',
        tenantId: 't1',
        title: 'Test',
        content: 'Content',
      };
      mockPrismaService.knowledgeAsset.create.mockResolvedValue(mockResult);

      const result = await service.create('t1', 'Test', 'Content');
      expect(result).toEqual(mockResult);
      expect(mockPrismaService.knowledgeAsset.create).toHaveBeenCalledWith({
        data: { tenantId: 't1', title: 'Test', content: 'Content' },
      });
    });
  });

  describe('findAll', () => {
    it('should return all knowledge assets for a tenant', async () => {
      const mockResult = [
        { id: '1', tenantId: 't1', title: 'Test', content: 'Content' },
      ];
      mockPrismaService.knowledgeAsset.findMany.mockResolvedValue(mockResult);

      const result = await service.findAll('t1');
      expect(result).toEqual(mockResult);
      expect(mockPrismaService.knowledgeAsset.findMany).toHaveBeenCalledWith({
        where: { tenantId: 't1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single knowledge asset if found', async () => {
      const mockResult = {
        id: '1',
        tenantId: 't1',
        title: 'Test',
        content: 'Content',
      };
      mockPrismaService.knowledgeAsset.findFirst.mockResolvedValue(mockResult);

      const result = await service.findOne('t1', '1');
      expect(result).toEqual(mockResult);
      expect(mockPrismaService.knowledgeAsset.findFirst).toHaveBeenCalledWith({
        where: { id: '1', tenantId: 't1' },
      });
    });

    it('should throw NotFoundException if asset not found', async () => {
      mockPrismaService.knowledgeAsset.findFirst.mockResolvedValue(null);

      await expect(service.findOne('t1', '1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the knowledge asset', async () => {
      const mockAsset = {
        id: '1',
        tenantId: 't1',
        title: 'Test',
        content: 'Content',
      };
      const mockUpdated = {
        id: '1',
        tenantId: 't1',
        title: 'New Title',
        content: 'New Content',
      };

      mockPrismaService.knowledgeAsset.findFirst.mockResolvedValue(mockAsset);
      mockPrismaService.knowledgeAsset.update.mockResolvedValue(mockUpdated);

      const result = await service.update(
        't1',
        '1',
        'New Title',
        'New Content',
      );
      expect(result).toEqual(mockUpdated);
      expect(mockPrismaService.knowledgeAsset.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { title: 'New Title', content: 'New Content' },
      });
    });

    it('should throw NotFoundException if asset to update not found', async () => {
      mockPrismaService.knowledgeAsset.findFirst.mockResolvedValue(null);
      await expect(service.update('t1', '1', 'New Title')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove the knowledge asset', async () => {
      const mockAsset = {
        id: '1',
        tenantId: 't1',
        title: 'Test',
        content: 'Content',
      };
      mockPrismaService.knowledgeAsset.findFirst.mockResolvedValue(mockAsset);
      mockPrismaService.knowledgeAsset.delete.mockResolvedValue(mockAsset);

      const result = await service.remove('t1', '1');
      expect(result).toEqual(mockAsset);
      expect(mockPrismaService.knowledgeAsset.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if asset to delete not found', async () => {
      mockPrismaService.knowledgeAsset.findFirst.mockResolvedValue(null);
      await expect(service.remove('t1', '1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
