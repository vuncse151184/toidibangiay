import { Provider } from '@nestjs/common';
import Redis from 'ioredis';

import { env } from '../config/env';
import { REDIS } from './redis.tokens';

export const redisProvider: Provider = {
  provide: REDIS,
  useFactory: () => {
    const redis = new Redis(env.REDIS_URL, {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 100, 500)),
    });

    redis.on('error', () => undefined);

    return redis;
  },
};
