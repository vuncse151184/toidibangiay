import { Global, Module } from '@nestjs/common';

import { REDIS } from './redis.tokens';
import { redisProvider } from './redis.provider';

@Global()
@Module({
  providers: [redisProvider],
  exports: [REDIS],
})
export class RedisModule {}
