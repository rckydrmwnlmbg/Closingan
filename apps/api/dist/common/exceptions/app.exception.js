"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppException = void 0;
const common_1 = require("@nestjs/common");
class AppException extends common_1.HttpException {
    constructor(code, message, httpStatus = 400, details = {}) {
        super({ success: false, error: { code, message, details } }, httpStatus);
    }
}
exports.AppException = AppException;
//# sourceMappingURL=app.exception.js.map