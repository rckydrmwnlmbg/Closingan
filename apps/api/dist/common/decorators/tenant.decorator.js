"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantId = void 0;
const common_1 = require("@nestjs/common");
const app_exception_1 = require("../exceptions/app.exception");
exports.TenantId = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.tenantId) {
        throw new app_exception_1.AppException('UNAUTHORIZED', 'Akses ditolak: Tenant ID tidak ditemukan dalam token.', 401);
    }
    return user.tenantId;
});
//# sourceMappingURL=tenant.decorator.js.map