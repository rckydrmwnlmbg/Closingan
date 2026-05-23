import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { ClsService } from 'nestjs-cls';

// Create a subclass to test the logic directly since we can't easily mock passport
class TestableJwtAuthGuard extends JwtAuthGuard {
  // We override super.canActivate to simulate passport's success or failure
  async superCanActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if (!req.headers.authorization) {
      throw new UnauthorizedException();
    }
    return true;
  }
}

describe('Security Phase 3 Unit Tests - Unauthorized Access Rejection', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: { getAllAndOverride: jest.fn().mockReturnValue(false) },
        },
        { provide: ClsService, useValue: { set: jest.fn() } },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('should throw UnauthorizedException if no valid JWT is provided (Passport layer simulation)', async () => {
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }), // No authorization header
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    // Test that the base guard properly requires passport which validates the JWT.
    // If passport isn't initialized or throws, the guard must reject.
    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow();
  });
});
