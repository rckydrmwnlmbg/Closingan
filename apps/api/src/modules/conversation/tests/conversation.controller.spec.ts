import { Test, TestingModule } from '@nestjs/testing';
import { ConversationController } from '../conversation.controller';
import { ConversationService } from '../conversation.service';

describe('ConversationController', () => {
  let controller: ConversationController;
  let service: ConversationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationController],
      providers: [
        {
          provide: ConversationService,
          useValue: {
            getMessages: jest.fn().mockResolvedValue({ data: [], meta: {} }),
            getMessagesByPhone: jest
              .fn()
              .mockResolvedValue({ data: [], meta: {} }),
            sendMessageManual: jest.fn().mockResolvedValue({}),
            getConversations: jest
              .fn()
              .mockResolvedValue({ data: [], meta: {} }),
            generateAiSuggestion: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<ConversationController>(ConversationController);
    service = module.get<ConversationService>(ConversationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMessages', () => {
    it('should call getMessages with default limit', async () => {
      await controller.getMessages('tenant-1', 'conv-1');
      expect(service.getMessages).toHaveBeenCalledWith(
        'tenant-1',
        'conv-1',
        undefined,
        30,
      );
    });
  });

  describe('getMessagesByPhone', () => {
    it('should call getMessagesByPhone with default limit', async () => {
      await controller.getMessagesByPhone('tenant-1', '08123456789');
      expect(service.getMessagesByPhone).toHaveBeenCalledWith(
        'tenant-1',
        '08123456789',
        undefined,
        30,
      );
    });
  });
});
