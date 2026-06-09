import {
  ForbiddenException,
  Inject,
  Injectable,
  TooManyRequestsException,
} from '@nestjs/common';
import Redis from 'ioredis';

import { REDIS } from '../../../../shared/cache/redis.tokens';
import {
  LoginRateLimitResult,
  LoginRateLimitServicePort,
} from '../../domain/ports/login-rate-limit.service.port';

@Injectable()
export class RedisLoginRateLimitService implements LoginRateLimitServicePort {
  private readonly emailTtlSeconds = 15 * 60;
  private readonly ipTtlSeconds = 60;
  private readonly emailMaxFails = 5;
  private readonly ipMaxFails = 20;

  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async assertNotRateLimited(emailNormalized: string, ipAddress?: string): Promise<void> {
    const emailKey = this.emailKey(emailNormalized);
    const emailFailures = Number((await this.redis.get(emailKey)) ?? 0);

    if (emailFailures >= this.emailMaxFails) {
      throw new ForbiddenException('Too many failed attempts');
    }

    if (ipAddress) {
      const ipKey = this.ipKey(ipAddress);
      const ipFailures = Number((await this.redis.get(ipKey)) ?? 0);

      if (ipFailures >= this.ipMaxFails) {
        throw new TooManyRequestsException('Too many requests');
      }
    }
  }

  async registerFailure(
    emailNormalized: string,
    ipAddress?: string,
  ): Promise<LoginRateLimitResult> {
    const emailKey = this.emailKey(emailNormalized);
    const emailCount = await this.redis.incr(emailKey);

    if (emailCount === 1) {
      await this.redis.expire(emailKey, this.emailTtlSeconds);
    }

    if (ipAddress) {
      const ipKey = this.ipKey(ipAddress);
      const ipCount = await this.redis.incr(ipKey);

      if (ipCount === 1) {
        await this.redis.expire(ipKey, this.ipTtlSeconds);
      }
    }

    if (emailCount >= this.emailMaxFails) {
      return {
        lockedUntil: new Date(Date.now() + this.emailTtlSeconds * 1000),
      };
    }

    return { lockedUntil: null };
  }

  async reset(emailNormalized: string, _ipAddress?: string): Promise<void> {
    await this.redis.del(this.emailKey(emailNormalized));
  }

  private emailKey(emailNormalized: string): string {
    return `login:email:${emailNormalized}`;
  }

  private ipKey(ipAddress: string): string {
    return `login:ip:${ipAddress}`;
  }
}
