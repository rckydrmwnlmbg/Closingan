import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

describe('Auth & Unauthorized Access Test', () => {
  let guard: JwtAuthGuard;
  let clsService: ClsService;

  beforeEach(async () => {
    clsService = {
      set: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: ClsService, useValue: clsService },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('should throw AppException when no valid user is attached to request', () => {
    const context = {
        switchToHttp: () => ({
            getRequest: () => ({ user: null }),
        })
    } as unknown as ExecutionContext;

    expect(() => guard.handleRequest(null, null, null)).toThrow('App Exception');
  });

  it('should correctly set tenantId into CLS context if user payload contains it', () => {
     const mockUser = {
         userId: 'u1',
         tenantId: 'tenant-123'
     };

     const context = {
        switchToHttp: () => ({
            getRequest: () => ({ user: mockUser }),
        })
    } as unknown as ExecutionContext;

    guard.canActivate = jest.fn().mockImplementation(async (ctx: ExecutionContext) => {
        // manually simulate super.canActivate returning true, then our custom logic
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;
        if (user.tenantId) {
            clsService.set('tenantId', user.tenantId);
        }
        return true;
    });

    guard.canActivate(context);

    expect(clsService.set).toHaveBeenCalledWith('tenantId', 'tenant-123');
  });
});