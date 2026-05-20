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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var OpenAiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = __importDefault(require("openai"));
const ai_safety_service_1 = require("./ai-safety.service");
let OpenAiService = OpenAiService_1 = class OpenAiService {
    configService;
    aiSafetyService;
    openai;
    logger = new common_1.Logger(OpenAiService_1.name);
    constructor(configService, aiSafetyService) {
        this.configService = configService;
        this.aiSafetyService = aiSafetyService;
        const apiKey = this.configService.get('OPENAI_API_KEY');
        if (!apiKey) {
            throw new common_1.InternalServerErrorException('OPENAI_API_KEY is not configured');
        }
        this.openai = new openai_1.default({
            apiKey: apiKey,
        });
    }
    async generateReply(tenantId, prompt) {
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
            });
            const output = response.choices[0]?.message?.content || '';
            const isSafe = this.aiSafetyService.validateOutput(output);
            if (!isSafe) {
                throw new Error('AI Output failed safety validation');
            }
            this.logger.log(`AI Reply Generated for Tenant: ${tenantId}`);
            return output;
        }
        catch (error) {
            this.logger.error(`Failed to generate reply from OpenAI for Tenant: ${tenantId}`);
            throw new common_1.InternalServerErrorException('Failed to generate AI reply');
        }
    }
    async analyzeLead(tenantId, conversation) {
        try {
            const systemInstruction = `You are an expert sales lead analyst. Analyze the following conversation and return a JSON object describing the lead's intent, status, and any extracted information.`;
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemInstruction },
                    { role: 'user', content: conversation },
                ],
                response_format: { type: 'json_object' },
            });
            const output = response.choices[0]?.message?.content || '{}';
            const isSafe = this.aiSafetyService.validateOutput(output);
            if (!isSafe) {
                throw new Error('AI Output failed safety validation during lead analysis');
            }
            this.logger.log(`Lead Analyzed for Tenant: ${tenantId}`);
            return JSON.parse(output);
        }
        catch (error) {
            this.logger.error(`Failed to analyze lead from OpenAI for Tenant: ${tenantId}`);
            throw new common_1.InternalServerErrorException('Failed to analyze lead');
        }
    }
};
exports.OpenAiService = OpenAiService;
exports.OpenAiService = OpenAiService = OpenAiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        ai_safety_service_1.AiSafetyService])
], OpenAiService);
//# sourceMappingURL=openai.service.js.map