import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';

describe('KnowledgeController', () => {
  let controller: KnowledgeController;

  const mockKnowledgeService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = { tenantId: 't1' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KnowledgeController],
      providers: [
        {
          provide: KnowledgeService,
          useValue: mockKnowledgeService,
        },
      ],
    }).compile();

    controller = module.get<KnowledgeController>(KnowledgeController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a knowledge asset', async () => {
      const dto = { title: 'Test', content: 'Content' };
      const expectedResult = { id: '1', tenantId: 't1', ...dto };
      mockKnowledgeService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(mockUser, dto);
      expect(result).toEqual(expectedResult);
      expect(mockKnowledgeService.create).toHaveBeenCalledWith(
        't1',
        'Test',
        'Content',
      );
    });
  });

  describe('findAll', () => {
    it('should return all knowledge assets', async () => {
      const expectedResult = [
        { id: '1', tenantId: 't1', title: 'Test', content: 'Content' },
      ];
      mockKnowledgeService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(mockUser);
      expect(result).toEqual(expectedResult);
      expect(mockKnowledgeService.findAll).toHaveBeenCalledWith('t1');
    });
  });

  describe('findOne', () => {
    it('should return a single knowledge asset', async () => {
      const expectedResult = {
        id: '1',
        tenantId: 't1',
        title: 'Test',
        content: 'Content',
      };
      mockKnowledgeService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(mockUser, '1');
      expect(result).toEqual(expectedResult);
      expect(mockKnowledgeService.findOne).toHaveBeenCalledWith('t1', '1');
    });
  });

  describe('update', () => {
    it('should update a knowledge asset', async () => {
      const dto = { title: 'New Title' };
      const expectedResult = {
        id: '1',
        tenantId: 't1',
        title: 'New Title',
        content: 'Content',
      };
      mockKnowledgeService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(mockUser, '1', dto);
      expect(result).toEqual(expectedResult);
      expect(mockKnowledgeService.update).toHaveBeenCalledWith(
        't1',
        '1',
        'New Title',
        undefined,
      );
    });
  });

  describe('remove', () => {
    it('should remove a knowledge asset', async () => {
      const expectedResult = {
        id: '1',
        tenantId: 't1',
        title: 'Test',
        content: 'Content',
      };
      mockKnowledgeService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(mockUser, '1');
      expect(result).toEqual(expectedResult);
      expect(mockKnowledgeService.remove).toHaveBeenCalledWith('t1', '1');
    });
  });
});
