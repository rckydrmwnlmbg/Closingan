"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AiReplyWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiReplyWorker = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
let AiReplyWorker = AiReplyWorker_1 = class AiReplyWorker extends bullmq_1.WorkerHost {
    logger = new common_1.Logger(AiReplyWorker_1.name);
    async process(job) {
        this.logger.debug(`Processing ai-reply job ${job.id}`);
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { success: true };
    }
};
exports.AiReplyWorker = AiReplyWorker;
exports.AiReplyWorker = AiReplyWorker = AiReplyWorker_1 = __decorate([
    (0, bullmq_1.Processor)('ai-reply', {
        concurrency: 50,
    })
], AiReplyWorker);
//# sourceMappingURL=ai-reply.worker.js.map