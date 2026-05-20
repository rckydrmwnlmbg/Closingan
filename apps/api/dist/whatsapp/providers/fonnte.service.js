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
var FonnteService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FonnteService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let FonnteService = FonnteService_1 = class FonnteService {
    httpService;
    configService;
    baseUrl;
    logger = new common_1.Logger(FonnteService_1.name);
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        const url = this.configService.get('FONNTE_API_URL');
        if (!url) {
            throw new common_1.InternalServerErrorException('FONNTE_API_URL is not configured');
        }
        this.baseUrl = url;
    }
    async sendMessage(options) {
        const { tenantId, to, message, tenantToken } = options;
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/send`, {
                target: to,
                message: message,
            }, {
                headers: {
                    Authorization: tenantToken,
                },
            }));
            const data = response.data;
            if (data && data.status) {
                this.logger.log(`Message sent successfully for Tenant: ${tenantId || 'Unknown'}`);
                return {
                    success: true,
                    messageId: data.id && data.id.length > 0 ? data.id[0] : undefined,
                };
            }
            this.logger.error(`Fonnte API returned false for Tenant: ${tenantId || 'Unknown'} - Reason: ${data?.reason}`);
            return {
                success: false,
                error: data?.reason || 'Unknown Fonnte Error',
            };
        }
        catch (error) {
            let errorMessage = 'Failed to send message via Fonnte';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            this.logger.error(`Fonnte send message failed for Tenant: ${tenantId || 'Unknown'} - Error: ${errorMessage}`);
            return {
                success: false,
                error: errorMessage,
            };
        }
    }
    async checkConnectionStatus(tenantToken, tenantId) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/device`, {}, {
                headers: {
                    Authorization: tenantToken,
                },
            }));
            const data = response.data;
            if (data && data.status) {
                this.logger.log(`Connection status checked for Tenant: ${tenantId || 'Unknown'} - Status: ${data.device_status}`);
                return {
                    isConnected: data.device_status === 'connect',
                    device: data.device,
                    name: data.name,
                };
            }
            this.logger.warn(`Connection status false for Tenant: ${tenantId || 'Unknown'}`);
            return {
                isConnected: false,
            };
        }
        catch (error) {
            this.logger.error(`Failed to check connection status for Tenant: ${tenantId || 'Unknown'}`);
            return {
                isConnected: false,
            };
        }
    }
    validateWebhookSignature(_payload, _signature, tenantId) {
        this.logger.log(`Webhook signature validation called for Tenant: ${tenantId || 'Unknown'}`);
        return true;
    }
};
exports.FonnteService = FonnteService;
exports.FonnteService = FonnteService = FonnteService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], FonnteService);
//# sourceMappingURL=fonnte.service.js.map