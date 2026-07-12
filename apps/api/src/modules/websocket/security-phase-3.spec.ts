import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConversationGateway } from './conversation.gateway';
import { ClsService } from 'nestjs-cls';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../common/redis/redis.service';

describe('Security Phase 3 Unit Tests', () => {
  let gateway: ConversationGateway;
  let mockClsService: Partial<ClsService>;
  let mockJwtService: Partial<JwtService>;
  let mockConfigService: Partial<ConfigService>;
  let mockServer: any;

  beforeEach(async () => {
    mockClsService = {
      get: jest.fn(),
    };
    mockJwtService = {
      verifyAsync: jest.fn(),
    };
    mockConfigService = {
      get: jest.fn(),
    };

    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationGateway,
        { provide: ClsService, useValue: mockClsService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { 
          provide: RedisService, 
          useValue: { 
            _store: {},
            get: jest.fn().mockImplementation(function(key) { return Promise.resolve(this._store[key]); }), 
            set: jest.fn().mockImplementation(function(key, val) { this._store[key] = val; return Promise.resolve('OK'); }), 
            del: jest.fn().mockImplementation(function(key) { delete this._store[key]; return Promise.resolve(1); }) 
          } 
        },
      ],
    }).compile();

    gateway = module.get<ConversationGateway>(ConversationGateway);
    gateway.server = mockServer;
    // mock logger to prevent console noise
    (gateway as any).logger = {
      warn: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
    };
  });

  describe('WebSocket Broadcast Isolation', () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });
    afterAll(() => {
      jest.useRealTimers();
    });
    it('should reject broadcast if ClsService context does not match target tenantId', () => {
      (mockClsService.get as jest.Mock).mockReturnValue('tenant-A');

      gateway.broadcastConversationUpdated('tenant-B', {
        conversationId: '123',
        unreadCount: 1,
        lastMessage: 'test',
      });

      expect(mockServer.to).not.toHaveBeenCalled();
      expect((gateway as any).logger.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          'Security Violation: Attempted cross-tenant broadcast',
        ),
      );
    });

    it('should allow broadcast if ClsService context matches target tenantId', () => {
      (mockClsService.get as jest.Mock).mockReturnValue('tenant-A');

      jest.spyOn(gateway as any, 'emitDebounced').mockImplementation((room, event, key, data) => {
        mockServer.to(room).emit(event, data);
      });

      gateway.broadcastConversationUpdated('tenant-A', {
        conversationId: '123',
        unreadCount: 1,
        lastMessage: 'test',
      });

      expect(mockServer.to).toHaveBeenCalledWith('tenant-tenant-A');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'conversation:updated',
        expect.any(Object),
      );
    });
  });
});
