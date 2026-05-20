/* eslint-disable */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../audit.service';
import { AUDIT_ACTION_KEY } from '../decorators/audit.decorator';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;
    const sanitized = { ...body };
    const sensitiveKeys = ['password', 'token', 'refreshToken', 'secret'];
    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeBody(sanitized[key]);
      }
    }
    return sanitized;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditAction = this.reflector.get<AuditAction>(
      AUDIT_ACTION_KEY,
      context.getHandler(),
    );

    if (!auditAction) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const request = context.switchToHttp().getRequest();

          let entityType: string | undefined;
          let entityId: string | undefined;

          if (data && typeof data === 'object') {
             if (data.id) {
                 entityId = data.id;
             } else if (data.data && data.data.id) {
                 entityId = data.data.id;
             }
          }

          if (auditAction.includes('USER')) entityType = 'User';
          else if (auditAction.includes('WA')) entityType = 'WhatsAppSession';
          else if (auditAction.includes('AI_MODE')) entityType = 'Conversation';
          else if (auditAction.includes('FOLLOW_UP')) entityType = 'FollowUp';

          const safeBody = this.sanitizeBody(request.body);

          this.auditService.log({
            action: auditAction,
            entityType,
            entityId,
            metadata: {
                path: request.url,
                method: request.method,
                body: safeBody,
                params: request.params,
                query: request.query,
                responseData: data,
            }
          }).catch(err => {
             // Let the audit service handle logging of its own errors
          });
        },
        error: (err) => {}
      }),
    );
  }
}
