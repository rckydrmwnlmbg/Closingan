"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseBuilder = void 0;
class ResponseBuilder {
    static success(data) {
        return { success: true, data };
    }
    static list(data, meta) {
        return { success: true, data, meta };
    }
}
exports.ResponseBuilder = ResponseBuilder;
//# sourceMappingURL=response.builder.js.map