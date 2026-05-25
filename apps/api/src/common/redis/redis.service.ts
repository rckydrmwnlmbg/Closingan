import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: Redis;

  constructor(private readonly configService: ConfigService) {
    this.redisClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      // Retry strategy to avoid infinite loops on disconnect
      retryStrategy: (times) => {
        if (times > 3) {
          return null;
        }
        return Math.min(times * 50, 2000);
      },
    });

    this.redisClient.on('error', (err) => {
      this.logger.error(`Redis Error: ${err.message}`, err.stack);
    });
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }

  getClient(): Redis {
    return this.redisClient;
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<'OK'> {
    if (ttlSeconds) {
      return this.redisClient.set(key, value, 'EX', ttlSeconds);
    }
    return this.redisClient.set(key, value);
  }

  async setNx(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<boolean> {
    const result = await this.redisClient.set(
      key,
      value,
      'EX',
      ttlSeconds,
      'NX',
    );
    return result === 'OK';
  }

  async del(key: string): Promise<number> {
    return this.redisClient.del(key);
  }

  async exists(key: string): Promise<number> {
    return this.redisClient.exists(key);
  }
}
