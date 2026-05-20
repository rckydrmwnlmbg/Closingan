/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { AuditInterceptor } from './audit.interceptor';
import { AuditService } from '../audit.service';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { AUDIT_ACTION_KEY } from '../decorators/audit.decorator';
import { AuditAction } from '@prisma/client';

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor;
  let auditService: AuditService;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditInterceptor,
        {
          provide: AuditService,
          useValue: {
            log: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    interceptor = module.get<AuditInterceptor>(AuditInterceptor);
    auditService = module.get<AuditService>(AuditService);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should skip interception if no @Audit decorator is found', (done) => {
    jest.spyOn(reflector, 'get').mockReturnValue(null);

    const mockContext = {
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: jest.fn().mockReturnValue(of('response data')),
    } as CallHandler;

    interceptor.intercept(mockContext, mockCallHandler).subscribe((data) => {
      expect(data).toBe('response data');
      expect(auditService.log).not.toHaveBeenCalled();
      done();
    });
  });

  it('should log audit successfully and sanitize sensitive body keys', (done) => {
    jest.spyOn(reflector, 'get').mockReturnValue('USER_LOGIN' as AuditAction);

    const mockRequest = {
      url: '/auth/login',
      method: 'POST',
      body: { email: 'test@example.com', password: 'my-secret-password' },
      params: {},
      query: {},
    };

    const mockContext = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const mockResponseData = { id: 'user-123', email: 'test@example.com' };
    const mockCallHandler = {
      handle: jest.fn().mockReturnValue(of(mockResponseData)),
    } as CallHandler;

    interceptor.intercept(mockContext, mockCallHandler).subscribe((data) => {
      expect(data).toEqual(mockResponseData);
      expect(auditService.log).toHaveBeenCalledWith({
        action: 'USER_LOGIN',
        entityType: 'User',
        entityId: 'user-123',
        metadata: {
           path: '/auth/login',
           method: 'POST',
           body: { email: 'test@example.com', password: '[REDACTED]' },
           params: mockRequest.params,
           query: mockRequest.query,
           responseData: mockResponseData,
        }
      });
      done();
    });
  });
});
