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
var TenantPrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantPrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const nestjs_cls_1 = require("nestjs-cls");
const EXEMPTED_MODELS = [
    'Tenant',
    'RefreshToken',
    'OtpCode',
    'UserBadge',
    'FailedJob',
    'User',
];
let TenantPrismaService = TenantPrismaService_1 = class TenantPrismaService {
    cls;
    baseClient;
    client;
    logger = new common_1.Logger(TenantPrismaService_1.name);
    constructor(cls) {
        this.cls = cls;
        this.baseClient = new client_1.PrismaClient();
        const self = this;
        this.client = this.baseClient.$extends({
            query: {
                $allModels: {
                    async $allOperations({ model, operation, args, query }) {
                        const tenantId = cls.get('tenantId');
                        if (EXEMPTED_MODELS.includes(model)) {
                            return query(args);
                        }
                        if (!tenantId) {
                            throw new Error(`Missing tenantId in context for model ${model}. Tenant Isolation Error.`);
                        }
                        const argsClone = args ? JSON.parse(JSON.stringify(args)) : {};
                        if (['findUnique', 'findUniqueOrThrow', 'findFirst', 'findFirstOrThrow', 'findMany', 'count', 'aggregate', 'groupBy'].includes(operation)) {
                            argsClone.where = { ...argsClone.where, tenantId };
                        }
                        else if (['create', 'createMany'].includes(operation)) {
                            if (operation === 'create') {
                                argsClone.data = { ...argsClone.data, tenantId };
                            }
                            else {
                                if (Array.isArray(argsClone.data)) {
                                    argsClone.data = argsClone.data.map((d) => ({ ...d, tenantId }));
                                }
                                else {
                                    argsClone.data = { ...argsClone.data, tenantId };
                                }
                            }
                        }
                        else if (['update', 'delete', 'upsert'].includes(operation)) {
                            if (argsClone.where) {
                                const checkArgs = { where: { ...argsClone.where, tenantId } };
                                const record = await self.baseClient[model].findFirst(checkArgs);
                                if (!record) {
                                    throw new Error(`Record not found or does not belong to tenant for operation ${operation} on model ${model}`);
                                }
                            }
                            if (operation === 'upsert') {
                                if (argsClone.create) {
                                    argsClone.create.tenantId = tenantId;
                                }
                                if (argsClone.update) {
                                    argsClone.update.tenantId = tenantId;
                                }
                            }
                        }
                        else if (['updateMany', 'deleteMany'].includes(operation)) {
                            argsClone.where = { ...argsClone.where, tenantId };
                        }
                        return query(argsClone);
                    },
                },
            },
        });
    }
    async onModuleInit() {
        await this.baseClient.$connect();
    }
    async onModuleDestroy() {
        await this.baseClient.$disconnect();
    }
};
exports.TenantPrismaService = TenantPrismaService;
exports.TenantPrismaService = TenantPrismaService = TenantPrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_cls_1.ClsService])
], TenantPrismaService);
//# sourceMappingURL=tenant-prisma.service.js.map