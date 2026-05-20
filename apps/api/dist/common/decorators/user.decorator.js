"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
const app_exception_1 = require("../exceptions/app.exception");
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
        throw new app_exception_1.AppException('UNAUTHORIZED', 'Akses ditolak: User tidak ditemukan.', 401);
    }
    return user;
});
//# sourceMappingURL=user.decorator.js.map