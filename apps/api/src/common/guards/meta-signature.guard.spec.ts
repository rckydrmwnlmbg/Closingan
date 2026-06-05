import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MetaSignatureGuard } from './meta-signature.guard';
import { createHmac } from 'crypto';

describe('MetaSignatureGuard', () => {
  let guard: MetaSignatureGuard;
  let configService: ConfigService;

  const mockAppSecret = 'test_secret';
  const mockPayload = JSON.stringify({ message: 'hello' });
  const mockRawBody = Buffer.from(mockPayload, 'utf8');

  const generateSignature = (payload: string, secret: string) => {
    const hmac = createHmac('sha256', secret);
    hmac.update(payload);
    return `sha256=${hmac.digest('hex')}`;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetaSignatureGuard,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key) => {
              if (key === 'META_APP_SECRET') {
                return mockAppSecret;
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    guard = module.get<MetaSignatureGuard>(MetaSignatureGuard);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  const createMockContext = (headers: any, rawBody: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
          rawBody,
        }),
      }),
    } as ExecutionContext;
  };

  it('should allow request with valid signature', () => {
    const signature = generateSignature(mockPayload, mockAppSecret);
    const context = createMockContext(
      { 'x-hub-signature-256': signature },
      mockRawBody,
    );

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw UnauthorizedException if signature header is missing', () => {
    const context = createMockContext({}, mockRawBody);

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(context)).toThrow('Missing signature');
  });

  it('should throw UnauthorizedException if signature is invalid', () => {
    const invalidSignature = generateSignature(mockPayload, 'wrong_secret');
    const context = createMockContext(
      { 'x-hub-signature-256': invalidSignature },
      mockRawBody,
    );

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(context)).toThrow('Invalid signature');
  });

  it('should throw UnauthorizedException if signature format is incorrect', () => {
    const context = createMockContext(
      { 'x-hub-signature-256': 'md5=invalid_hash' },
      mockRawBody,
    );

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(context)).toThrow(
      'Invalid signature format',
    );
  });

  it('should throw UnauthorizedException if raw body is missing', () => {
    const signature = generateSignature(mockPayload, mockAppSecret);
    const context = createMockContext(
      { 'x-hub-signature-256': signature },
      null,
    );

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(context)).toThrow('Missing raw body');
  });

  it('should throw UnauthorizedException if META_APP_SECRET is not configured', () => {
    jest.spyOn(configService, 'get').mockReturnValue(null);
    const signature = generateSignature(mockPayload, mockAppSecret);
    const context = createMockContext(
      { 'x-hub-signature-256': signature },
      mockRawBody,
    );

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(context)).toThrow(
      'Server configuration error',
    );
  });
});
