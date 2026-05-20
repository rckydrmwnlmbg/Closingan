/* eslint-disable */
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClsService } from 'nestjs-cls';
import { AppException } from '../exceptions/app.exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly cls: ClsService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw (
        err ||
        new AppException('UNAUTHORIZED', 'Token tidak valid atau expired.', 401)
      );
    }

    const request = context.switchToHttp().getRequest();

    // Inject contextual info into CLS context
    if (user.tenantId) {
      this.cls.set('tenantId', user.tenantId);
    }
    // Note: JwtStrategy maps payload.sub to user.userId
    if (user.userId) {
      this.cls.set('userId', user.userId);
    } else if (user.id) {
      this.cls.set('userId', user.id);
    }

    // Inject request info
    if (request) {
      const ip =
        request.ip ||
        request.headers['x-forwarded-for'] ||
        request.socket?.remoteAddress;
      if (ip) this.cls.set('ipAddress', ip);

      const userAgent = request.headers['user-agent'];
      if (userAgent) this.cls.set('userAgent', userAgent);
    }

    return user;
  }
}
