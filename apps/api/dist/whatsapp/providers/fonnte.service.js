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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FonnteService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let FonnteService = class FonnteService {
    httpService;
    configService;
    baseUrl;
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
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/send`, {
                target: options.to,
                message: options.message,
            }, {
                headers: {
                    Authorization: options.tenantToken,
                },
            }));
            const data = response.data;
            if (data && data.status) {
                return {
                    success: true,
                    messageId: data.id && data.id.length > 0 ? data.id[0] : undefined,
                };
            }
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
            return {
                success: false,
                error: errorMessage,
            };
        }
    }
    async checkConnectionStatus(tenantToken) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/device`, {}, {
                headers: {
                    Authorization: tenantToken,
                },
            }));
            const data = response.data;
            if (data && data.status) {
                return {
                    isConnected: data.device_status === 'connect',
                    device: data.device,
                    name: data.name,
                };
            }
            return {
                isConnected: false,
            };
        }
        catch {
            return {
                isConnected: false,
            };
        }
    }
    validateWebhookSignature(_payload, _signature) {
        return true;
    }
};
exports.FonnteService = FonnteService;
exports.FonnteService = FonnteService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], FonnteService);
//# sourceMappingURL=fonnte.service.js.map