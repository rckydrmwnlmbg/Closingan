import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
export interface AuditLogPayload {
    tenantId?: string;
    userId?: string;
    action: AuditAction;
    entityType?: string;
    entityId?: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
}
export declare class AuditService {
    private readonly prisma;
    private readonly cls;
    private readonly logger;
    constructor(prisma: PrismaService, cls: ClsService);
    log(payload: AuditLogPayload): Promise<void>;
}
