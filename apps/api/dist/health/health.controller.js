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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const response_builder_1 = require("../common/helpers/response.builder");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let HealthController = class HealthController {
    healthQueue;
    constructor(healthQueue) {
        this.healthQueue = healthQueue;
    }
    async check() {
        await this.healthQueue.add('health-check-job', { timestamp: Date.now() });
        return response_builder_1.ResponseBuilder.success({ status: 'ok', queue: 'job added' });
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "check", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)('health'),
    __param(0, (0, bullmq_1.InjectQueue)('health-check')),
    __metadata("design:paramtypes", [bullmq_2.Queue])
], HealthController);
//# sourceMappingURL=health.controller.js.map