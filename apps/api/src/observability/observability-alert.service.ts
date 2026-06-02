import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ObservabilityMetricsService } from './observability-metrics.service';
import type { WhatsappProviderInterface } from '../whatsapp/interfaces/whatsapp-provider.interface';
import { WHATSAPP_PROVIDER } from '../whatsapp/interfaces/whatsapp-provider.interface';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ObservabilityAlertService {
  private readonly logger = new Logger(ObservabilityAlertService.name);
  private founderWaNumber: string | undefined;

  constructor(
    private readonly metricsService: ObservabilityMetricsService,
    @Inject(WHATSAPP_PROVIDER)
    private readonly whatsappProvider: WhatsappProviderInterface,
    private readonly configService: ConfigService,
  ) {
    this.founderWaNumber = this.configService.get<string>('FOUNDER_WA_NUMBER');
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkMetricsAndAlert() {
    this.logger.debug('Running metrics check...');

    if (!this.founderWaNumber) {
      this.logger.warn('FOUNDER_WA_NUMBER not configured. Skipping alerts.');
      return;
    }

    const totalRequests = await this.metricsService.getAndResetMetrics('http_requests_total');
    const errorRequests = await this.metricsService.getAndResetMetrics('http_requests_error');
    const totalAiRequests = await this.metricsService.getAndResetMetrics('ai_requests_total');
    const errorAiRequests = await this.metricsService.getAndResetMetrics('ai_requests_error');

    // 1. Error rate > 5% in 5 minutes
    if (totalRequests > 0) {
      const errorRate = (errorRequests / totalRequests) * 100;
      if (errorRate > 5) {
        this.logger.warn(`High HTTP error rate detected: ${errorRate.toFixed(2)}%`);
        await this.sendAlert(`🚨 [SYSTEM ALERT] 🚨\n\nHigh HTTP Error Rate: ${errorRate.toFixed(2)}%\nTotal Requests: ${totalRequests}\nErrors: ${errorRequests}`);
      }
    }

    // 2. AI failure rate > 10% in 5 minutes
    if (totalAiRequests > 0) {
      const aiErrorRate = (errorAiRequests / totalAiRequests) * 100;
      if (aiErrorRate > 10) {
        this.logger.warn(`High AI failure rate detected: ${aiErrorRate.toFixed(2)}%`);
        await this.sendAlert(`🚨 [SYSTEM ALERT] 🚨\n\nHigh AI Failure Rate: ${aiErrorRate.toFixed(2)}%\nTotal AI Requests: ${totalAiRequests}\nAI Errors: ${errorAiRequests}`);
      }
    }
  }

  private async sendAlert(message: string) {
    if (!this.founderWaNumber) return;
    try {
      // Use system token/tenantId if necessary to send to founder
      // It's an internal alert.
      await this.whatsappProvider.sendMessage({
        tenantId: 'SYSTEM', // special keyword for system alerts if supported by provider
        to: this.founderWaNumber,
        message,
      });
      this.logger.log(`Alert sent to founder: ${message}`);
    } catch (e) {
      this.logger.error('Failed to send observability alert to founder WA', e);
    }
  }
}
