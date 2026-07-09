import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * Get value from cache and track hit/miss
   * @param key Redis key
   * @param patternGroup Group name for monitoring (e.g. 'dashboard_summary')
   */
  async get<T>(key: string, patternGroup: string): Promise<T | null> {
    try {
      const data = await this.redisService.get(key);
      if (data) {
        // Log cache hit
        await this.redisService.incr(`cache:hit:${patternGroup}`);
        return JSON.parse(data) as T;
      } else {
        // Log cache miss
        await this.redisService.incr(`cache:miss:${patternGroup}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Cache get failed for ${key}: ${error instanceof Error ? error.message : 'Unknown'}`);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   * @param key Redis key
   * @param value Data to cache
   * @param ttlSeconds Time to live in seconds
   */
  async set(key: string, value: any, ttlSeconds: number): Promise<boolean> {
    try {
      const strValue = JSON.stringify(value);
      const res = await this.redisService.set(key, strValue, ttlSeconds);
      return res === 'OK';
    } catch (error) {
      this.logger.error(`Cache set failed for ${key}: ${error instanceof Error ? error.message : 'Unknown'}`);
      return false;
    }
  }

  /**
   * Invalidate specific key
   */
  async invalidate(key: string): Promise<void> {
    await this.redisService.del(key);
  }

  /**
   * Invalidate multiple keys by pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    await this.redisService.delPattern(pattern);
  }

  /**
   * Get hit rate for a specific pattern group
   */
  async getHitRate(patternGroup: string): Promise<{ hitRate: number; hits: number; misses: number }> {
    const hitsStr = await this.redisService.get(`cache:hit:${patternGroup}`);
    const missesStr = await this.redisService.get(`cache:miss:${patternGroup}`);
    
    const hits = hitsStr ? parseInt(hitsStr, 10) : 0;
    const misses = missesStr ? parseInt(missesStr, 10) : 0;
    const total = hits + misses;
    
    if (total === 0) return { hitRate: 0, hits: 0, misses: 0 };
    
    return {
      hitRate: (hits / total) * 100,
      hits,
      misses
    };
  }
}
