import { Provider } from '@nestjs/common';
import Redis from 'ioredis';

import { env } from '../config/env';
import { REDIS } from './redis.tokens';

export const redisProvider: Provider = {
  provide: REDIS,
  useFactory: () => new Redis(env.REDIS_URL),
};
