"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const config_1 = require("@nestjs/config");
const ai_reply_worker_1 = require("./workers/ai-reply.worker");
const hot_lead_worker_1 = require("./workers/hot-lead.worker");
const blast_campaign_worker_1 = require("./workers/blast-campaign.worker");
const health_check_worker_1 = require("./workers/health-check.worker");
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => {
                    const redisHost = configService.get('REDIS_HOST', 'localhost');
                    const redisPort = configService.get('REDIS_PORT', 6379);
                    const redisPassword = configService.get('REDIS_PASSWORD');
                    return {
                        connection: {
                            host: redisHost,
                            port: redisPort,
                            password: redisPassword,
                        },
                    };
                },
            }),
            bullmq_1.BullModule.registerQueue({
                name: 'ai-reply',
            }, {
                name: 'hot-lead',
            }, {
                name: 'blast-campaign',
            }, {
                name: 'health-check',
            }),
        ],
        providers: [
            ai_reply_worker_1.AiReplyWorker,
            hot_lead_worker_1.HotLeadWorker,
            blast_campaign_worker_1.BlastCampaignWorker,
            health_check_worker_1.HealthCheckWorker,
        ],
        exports: [bullmq_1.BullModule],
    })
], QueueModule);
//# sourceMappingURL=queue.module.js.map