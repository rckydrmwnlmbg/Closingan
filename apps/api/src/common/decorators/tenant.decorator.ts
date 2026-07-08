import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppException } from '../exceptions/app.exception';

export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: { tenantId?: string } }>();
    const user = request.user;

    if (!user || !user.tenantId) {
      throw new AppException(
        'UNAUTHORIZED',
        'Akses ditolak: Tenant ID tidak ditemukan dalam token.',
        401,
      );
    }

    return user.tenantId;
  },
);
