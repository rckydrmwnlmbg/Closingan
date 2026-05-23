import { Test, TestingModule } from '@nestjs/testing';
import { ConversationGateway } from '../conversation.gateway';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';

describe('Websocket Isolation Test', () => {
  let gateway: ConversationGateway;
  let clsService: ClsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationGateway,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ClsService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<ConversationGateway>(ConversationGateway);
    clsService = module.get<ClsService>(ClsService);

    // Mock the server
    gateway.server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should strictly use the tenantId from CLS context when emitting an event', () => {
    // Arrange
    const contextTenantId = 'tenant-xyz';
    jest.spyOn(clsService, 'get').mockReturnValue(contextTenantId);

    // Act
    gateway.broadcastConversationUpdated('fake-tenant', { conversationId: '1', unreadCount: 1, lastMessage: 'hey' });

    // Assert: It should ignore the 'fake-tenant' parameter and use the context tenant
    expect(clsService.get).toHaveBeenCalledWith('tenantId');
    expect(gateway.server.to).toHaveBeenCalledWith(`tenant-${contextTenantId}`);
    expect(gateway.server.emit).toHaveBeenCalledWith('conversation:updated', expect.any(Object));
  });

  it('should throw an error if CLS context is empty, strictly denying fallback to caller args', () => {
    // Arrange
    jest.spyOn(clsService, 'get').mockReturnValue(null);

    // Act & Assert
    expect(() => {
        gateway.broadcastConversationUpdated('some-hacker-tenant', { conversationId: '1', unreadCount: 1, lastMessage: 'hey' });
    }).toThrow('Tenant context missing for WebSocket broadcast.');
  });
});
