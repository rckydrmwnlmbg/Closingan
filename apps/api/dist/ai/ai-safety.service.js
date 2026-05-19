"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AiSafetyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiSafetyService = void 0;
const common_1 = require("@nestjs/common");
let AiSafetyService = AiSafetyService_1 = class AiSafetyService {
    logger = new common_1.Logger(AiSafetyService_1.name);
    validateOutput(output) {
        if (!output || typeof output !== 'string') {
            return false;
        }
        return true;
    }
};
exports.AiSafetyService = AiSafetyService;
exports.AiSafetyService = AiSafetyService = AiSafetyService_1 = __decorate([
    (0, common_1.Injectable)()
], AiSafetyService);
//# sourceMappingURL=ai-safety.service.js.map