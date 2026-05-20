/* eslint-disable */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

export interface AuditLogPayload {
  tenantId?: string; // Made optional because it should be auto-injected
  userId?: string;
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
      const tenantId = payload.tenantId || this.cls.get('tenantId');
      const userId = payload.userId || this.cls.get('userId');
      const ipAddress = payload.ipAddress || this.cls.get('ipAddress');
      const userAgent = payload.userAgent || this.cls.get('userAgent');

      if (!tenantId) {
        this.logger.warn(
          `Attempted to create audit log without tenantId for action: ${payload.action}`,
        );
        return;
      }

      await this.prisma.auditLog.create({
        data: {
          tenantId,
          userId,
          action: payload.action,
          entityType: payload.entityType,
          entityId: payload.entityId,
          metadata: payload.metadata ? payload.metadata : undefined,
          ipAddress,
          userAgent,
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
