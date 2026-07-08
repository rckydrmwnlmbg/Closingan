import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { AuthTokenService } from './auth-token.service';
import { AuthOtpService } from './auth-otp.service';
import { AppException } from '../common/exceptions/app.exception';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: any;
  let authOtpService: any;
  let auditService: any;

  beforeEach(async () => {
    prismaService = {
      auditLog: {
        count: jest.fn(),
      },
      abusiveClient: {
        upsert: jest.fn(),
      },
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      tenant: {
        create: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prismaService)),
    };

    authOtpService = {
      generateRegistrationOtp: jest.fn(),
    };

    auditService = {
      log: jest.fn(),
    };

    const authTokenService = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        { provide: AuditService, useValue: auditService },
        { provide: AuthTokenService, useValue: authTokenService },
        { provide: AuthOtpService, useValue: authOtpService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should throw EMAIL_DISPOSABLE if email is disposable', async () => {
      const dto = { email: 'test@mailinator.com', fullName: 'Test', password: 'password' };
      await expect(authService.register(dto, 'fingerprint')).rejects.toThrow(AppException);
    });

    it('should throw RATE_LIMITED and create abusiveClient if MAX_REGISTRATIONS exceeded', async () => {
      prismaService.auditLog.count.mockResolvedValue(2); // MAX_REGISTRATIONS is 2

      const dto = { email: 'test@gmail.com', fullName: 'Test', password: 'password' };
      await expect(authService.register(dto, 'banned_fingerprint')).rejects.toThrow(AppException);
      expect(prismaService.abusiveClient.upsert).toHaveBeenCalledWith({
        where: { fingerprintHash: 'banned_fingerprint' },
        create: expect.any(Object),
        update: {},
      });
    });

    it('should successfully register a user and send OTP', async () => {
      prismaService.auditLog.count.mockResolvedValue(0);
      prismaService.user.findFirst.mockResolvedValue(null);
      
      const mockTenant = { id: 'tenant-1', name: "Test's Tenant" };
      const mockUser = { id: 'user-1', email: 'test@gmail.com', tenantId: mockTenant.id };
      
      prismaService.tenant.create.mockResolvedValue(mockTenant);
      prismaService.user.create.mockResolvedValue(mockUser);

      const dto = { email: 'test@gmail.com', fullName: 'Test', password: 'password' };
      const result = await authService.register(dto, 'fingerprint');

      expect(result.userId).toBe('user-1');
      expect(authOtpService.generateRegistrationOtp).toHaveBeenCalledWith('user-1', 'test@gmail.com');
      expect(auditService.log).toHaveBeenCalledWith(expect.objectContaining({
        action: 'USER_REGISTER',
        metadata: { fingerprintHash: 'fingerprint' }
      }));
    });
  });
});
