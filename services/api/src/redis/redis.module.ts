import { Global, Module, OnModuleDestroy, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS = Symbol('REDIS');

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('RedisModule');
        const redisUrl = configService.get<string>('REDIS_URL', 'redis://localhost:6379');

        const redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
        });

        redis.on('connect', () => {
          logger.log('Redis connected');
        });

        redis.on('error', (err) => {
          logger.error('Redis connection error', err);
        });

        return redis;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS],
})
export class RedisModule implements OnModuleDestroy {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}
