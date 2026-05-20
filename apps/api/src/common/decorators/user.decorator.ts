import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppException } from '../exceptions/app.exception';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new AppException(
        'UNAUTHORIZED',
        'Akses ditolak: User tidak ditemukan.',
        401,
      );
    }

    return user;
  },
);
