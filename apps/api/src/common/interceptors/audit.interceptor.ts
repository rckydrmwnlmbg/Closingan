import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AuditService } from '../audit/audit.service';
import { AUDIT_ACTION_KEY } from '../decorators/audit.decorator';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const action =
      this.reflector.get<AuditAction>(AUDIT_ACTION_KEY, context.getHandler()) ||
      this.reflector.get<AuditAction>(AUDIT_ACTION_KEY, context.getClass());

    if (!action) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<{
      ip: string;
      connection: { remoteAddress: string };
      headers: { [key: string]: string };
      user?: { id?: string; tenantId?: string };
    }>();

    const ipAddress = request.ip || request.connection?.remoteAddress;
    const userAgent = request.headers['user-agent'];
    const userId = request.user?.id; // In case user is set on request directly
    const tenantId = request.user?.tenantId;

    return next.handle().pipe(
      tap(() => {
        // Asynchronously log the action
        this.auditService
          .log({
            action,
            ipAddress,
            userAgent,
            userId,
            tenantId,
            // Since this is a generic interceptor, we don't know the specific entity Type or Id
            // But it can be extended later if needed.
          })
          .catch(() => {
            // Log errors silently
          });
      }),
    );
  }
}
