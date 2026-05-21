import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClsService } from 'nestjs-cls';
import { AppException } from '../exceptions/app.exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly cls: ClsService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = await super.canActivate(context);
    if (!canActivate) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user) {
      // Inject the tenantId into CLS context
      if (user.tenantId) {
        this.cls.set('tenantId', user.tenantId);
      }

      // Also inject userId into CLS context for Audit logging and other purposes
      if (user.userId) {
        this.cls.set('user', { id: user.userId, ...user });
      }
    }

    return true;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw (
        err ||
        new AppException('UNAUTHORIZED', 'Token tidak valid atau expired.', 401)
      );
    }
    return user;
  }
}
