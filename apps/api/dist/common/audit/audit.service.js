"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const nestjs_cls_1 = require("nestjs-cls");
let AuditService = AuditService_1 = class AuditService {
    prisma;
    cls;
    logger = new common_1.Logger(AuditService_1.name);
    constructor(prisma, cls) {
        this.prisma = prisma;
        this.cls = cls;
    }
    async log(payload) {
        try {
            const tenantId = payload.tenantId || this.cls.get('tenantId');
            const userId = payload.userId || this.cls.get('user')?.id;
            if (!tenantId) {
                this.logger.warn(`Attempted to create audit log without tenantId for action: ${payload.action}`);
                return;
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
        }
        catch (error) {
            this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
        }
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        nestjs_cls_1.ClsService])
], AuditService);
//# sourceMappingURL=audit.service.js.map