import { Test, TestingModule } from '@nestjs/testing';
import { MessageIngestionService } from './message-ingestion.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { MessageQueueService } from '../../queue/services/message-queue.service';

describe('MessageIngestionService', () => {
  let service: MessageIngestionService;
  let mockPrismaService: Record<string, Record<string, jest.Mock>>;
  let mockClsService: Record<string, jest.Mock>;
  let mockMessageQueueService: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockPrismaService = {
      conversation: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      lead: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      message: {
        create: jest.fn(),
      },
    };

    mockMessageQueueService = {
      enqueueMessage: jest.fn(),
    };

    mockClsService = {
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageIngestionService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ClsService, useValue: mockClsService },
        { provide: MessageQueueService, useValue: mockMessageQueueService },
      ],
    }).compile();

    service = module.get<MessageIngestionService>(MessageIngestionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create new conversation, lead, and message when no history exists', async () => {
    const payload = {
      device: '628111',
      sender: '628999',
      message: 'Hello!',
      name: 'John Doe',
      id: 'msg-1',
    };

    mockPrismaService.conversation.findFirst.mockResolvedValue(null);
    mockPrismaService.conversation.create.mockResolvedValue({ id: 'conv-1' });
    mockPrismaService.lead.findUnique.mockResolvedValue(null);
    mockPrismaService.lead.create.mockResolvedValue({ id: 'lead-1' });
    mockPrismaService.message.create.mockResolvedValue({ id: 'message-1' });

    const result = await service.processIncomingMessage('tenant-1', payload);

    expect(result).toBeDefined();
    expect(mockClsService.set).toHaveBeenCalledWith('tenantId', 'tenant-1');
    expect(mockPrismaService.conversation.create).toHaveBeenCalledWith({
      data: {
        tenantId: 'tenant-1',
        customerPhone: '628999',
        customerName: 'John Doe',
      },
    });
    expect(mockPrismaService.lead.create).toHaveBeenCalledWith({
      data: {
        tenantId: 'tenant-1',
        conversationId: 'conv-1',
        customerPhone: '628999',
        customerName: 'John Doe',
      },
    });
    expect(mockPrismaService.message.create).toHaveBeenCalledWith({
      data: {
        tenantId: 'tenant-1',
        conversationId: 'conv-1',
        senderType: 'CUSTOMER',
        content: 'Hello!',
        externalId: 'msg-1',
      },
    });
  });

  it('should reuse existing conversation and lead', async () => {
    const payload = {
      device: '628111',
      sender: '628999',
      message: 'Another message',
      id: 'msg-2',
    };

    mockPrismaService.conversation.findFirst.mockResolvedValue({
      id: 'conv-1',
    });
    mockPrismaService.lead.findUnique.mockResolvedValue({ id: 'lead-1' });
    mockPrismaService.message.create.mockResolvedValue({ id: 'message-2' });

    const result = await service.processIncomingMessage('tenant-1', payload);

    expect(result).toBeDefined();
    expect(mockPrismaService.conversation.update).toHaveBeenCalledWith({
      where: { id: 'conv-1' },
      data: {
        updatedAt: expect.any(Date),
        customerName: 'Unknown',
      },
    });
    expect(mockPrismaService.lead.create).not.toHaveBeenCalled();
    expect(mockPrismaService.conversation.create).not.toHaveBeenCalled();
    expect(mockPrismaService.message.create).toHaveBeenCalledWith({
      data: {
        tenantId: 'tenant-1',
        conversationId: 'conv-1',
        senderType: 'CUSTOMER',
        content: 'Another message',
        externalId: 'msg-2',
      },
    });
  });

  it('should mark outgoing message as SELLER senderType', async () => {
    const payload = {
      device: '628111',
      sender: '628111',
      to: '628999',
      message: 'Reply from human',
      id: 'msg-3',
    };

    mockPrismaService.conversation.findFirst.mockResolvedValue({
      id: 'conv-1',
    });
    mockPrismaService.lead.findUnique.mockResolvedValue({ id: 'lead-1' });
    mockPrismaService.message.create.mockResolvedValue({ id: 'message-3' });

    const result = await service.processIncomingMessage('tenant-1', payload);

    expect(result).toBeDefined();
    expect(mockPrismaService.message.create).toHaveBeenCalledWith({
      data: {
        tenantId: 'tenant-1',
        conversationId: 'conv-1',
        senderType: 'SELLER',
        content: 'Reply from human',
        externalId: 'msg-3',
      },
    });
  });
});
