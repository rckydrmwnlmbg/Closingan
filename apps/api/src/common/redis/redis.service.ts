import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (redisUrl) {
      this.redisClient = new Redis(redisUrl, {
        tls: redisUrl.startsWith('rediss://')
          ? { rejectUnauthorized: false }
          : undefined,
        retryStrategy: (times) => Math.min(times * 1000, 5000),
      });
    } else {
      this.redisClient = new Redis({
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
        password: this.configService.get<string>('REDIS_PASSWORD'),
        tls:
          this.configService.get<string>('REDIS_TLS') === 'true'
            ? { rejectUnauthorized: false }
            : undefined,
        // Retry indefinitely to prevent queues from stalling or crashing the app, but with exponential backoff up to 5 seconds
        retryStrategy: (times) => {
          return Math.min(times * 1000, 5000);
        },
      });
    }

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
    try {
      return await this.redisClient.get(key);
    } catch (error) {
      this.logger.error(
        `Redis get failed for key ${key}: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
      return null; // Graceful fallback
    }
  }

  async set(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<'OK' | null> {
    try {
      if (ttlSeconds) {
        return await this.redisClient.set(key, value, 'EX', ttlSeconds);
      }
      return await this.redisClient.set(key, value);
    } catch (error) {
      this.logger.error(
        `Redis set failed for key ${key}: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
      return null;
    }
  }

  async setNx(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<boolean> {
    try {
      const result = await this.redisClient.set(
        key,
        value,
        'EX',
        ttlSeconds,
        'NX',
      );
      return result === 'OK';
    } catch (error) {
      this.logger.error(
        `Redis setNx failed for key ${key}: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
      return false;
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await this.redisClient.del(key);
    } catch (error) {
      this.logger.error(
        `Redis del failed for key ${key}: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
      return 0;
    }
  }

  async exists(key: string): Promise<number> {
    try {
      return await this.redisClient.exists(key);
    } catch (error) {
      this.logger.error(
        `Redis exists failed for key ${key}: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
      return 0;
    }
  }
}
