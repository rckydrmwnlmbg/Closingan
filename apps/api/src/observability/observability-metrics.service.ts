import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class ObservabilityMetricsService {
  private readonly logger = new Logger(ObservabilityMetricsService.name);

  constructor(private readonly redisService: RedisService) {}

  async incrementRequestCount() {
    await this.incrementMetric('http_requests_total');
  }

  async incrementErrorCount() {
    await this.incrementMetric('http_requests_error');
  }

  async incrementAiRequestCount() {
    await this.incrementMetric('ai_requests_total');
  }

  async incrementAiErrorCount() {
    await this.incrementMetric('ai_requests_error');
  }

  private async incrementMetric(key: string) {
    try {
      const client = this.redisService.getClient();
      await client.incr(`metrics:${key}`);
      // Expiration to avoid memory leak if needed, though they are tiny keys
    } catch (e) {
      this.logger.error(`Failed to increment metric ${key}`, e);
    }
  }

  async getAndResetMetrics(key: string): Promise<number> {
    try {
      const client = this.redisService.getClient();
      const val = await client.get(`metrics:${key}`);
      await client.set(`metrics:${key}`, '0');
      return parseInt(val || '0', 10);
    } catch (e) {
      this.logger.error(`Failed to get/reset metric ${key}`, e);
      return 0;
    }
  }
}
