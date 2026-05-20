import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

export interface AuditLogPayload {
  tenantId?: string; // Optional because we take it from ClsService
  userId?: string; // Optional because we can try to extract it from ClsService/Request
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
  ) {}

  async log(payload: AuditLogPayload) {
    try {
      // Prioritize explicit tenantId, otherwise fallback to CLS
      const tenantId = payload.tenantId || this.cls.get('tenantId');
      // Prioritize explicit userId, otherwise try fallback
      const userId = payload.userId || this.cls.get('user')?.id;

      if (!tenantId) {
        this.logger.warn(
          `Attempted to create audit log without tenantId for action: ${payload.action}`,
        );
        return; // Tenant isolation strict rule: do not log without tenantId
      }

      await this.prisma.auditLog.create({
        data: {
          tenantId: tenantId,
          userId: userId,
          action: payload.action,
          entityType: payload.entityType,
          entityId: payload.entityId,
          metadata: payload.metadata ? payload.metadata : undefined,
          ipAddress: payload.ipAddress,
          userAgent: payload.userAgent,
        },
      });
    } catch (error: any) {
      // We don't want audit logging to break the main application flow,
      // but we need to know if it's failing.
      this.logger.error(
        `Failed to create audit log: ${error.message}`,
        error.stack,
      );
    }
  }
}
