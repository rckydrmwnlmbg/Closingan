"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BlastCampaignWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlastCampaignWorker = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
let BlastCampaignWorker = BlastCampaignWorker_1 = class BlastCampaignWorker extends bullmq_1.WorkerHost {
    logger = new common_1.Logger(BlastCampaignWorker_1.name);
    async process(job) {
        this.logger.debug(`Processing blast-campaign job ${job.id}`);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { success: true };
    }
};
exports.BlastCampaignWorker = BlastCampaignWorker;
exports.BlastCampaignWorker = BlastCampaignWorker = BlastCampaignWorker_1 = __decorate([
    (0, bullmq_1.Processor)('blast-campaign', {
        concurrency: 1,
        limiter: {
            max: 10,
            duration: 1000,
        },
    })
], BlastCampaignWorker);
//# sourceMappingURL=blast-campaign.worker.js.map