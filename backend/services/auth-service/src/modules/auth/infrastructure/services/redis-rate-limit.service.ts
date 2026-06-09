import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

import { REDIS } from '../../../../shared/cache/redis.tokens';
import { LoginRateLimitServicePort } from '../../domain/ports/login-rate-limit.service.port';

const MAX_FAILURES = 5;
const WINDOW_SECONDS = 15 * 60;
const LOCKOUT_SECONDS = 15 * 60;

@Injectable()
export class RedisRateLimitService implements LoginRateLimitServicePort {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  private emailKey(email: string): string {
    return `auth:rl:email:${email}`;
  }

  private ipKey(ip: string): string {
    return `auth:rl:ip:${ip}`;
  }

  private isRedisUnavailable(error: unknown): boolean {
    return (
      error instanceof Error &&
      (error.message.includes('Connection is closed') ||
        error.message.includes('Stream isn\'t writeable') ||
        error.message.includes('ECONNREFUSED'))
    );
  }

  async assertNotRateLimited(emailNormalized: string, ipAddress?: string): Promise<void> {
    try {
      const emailCount = parseInt((await this.redis.get(this.emailKey(emailNormalized))) ?? '0', 10);
      if (emailCount >= MAX_FAILURES) {
        throw new HttpException('Too many failed login attempts. Try again later.', HttpStatus.TOO_MANY_REQUESTS);
      }
      if (ipAddress) {
        const ipCount = parseInt((await this.redis.get(this.ipKey(ipAddress))) ?? '0', 10);
        if (ipCount >= MAX_FAILURES * 3) {
          throw new HttpException('Too many requests from this IP. Try again later.', HttpStatus.TOO_MANY_REQUESTS);
        }
      }
    } catch (error) {
      if (this.isRedisUnavailable(error)) return;
      throw error;
    }
  }

  async registerFailure(
    emailNormalized: string,
    ipAddress?: string,
  ): Promise<{ lockedUntil: Date | null }> {
    try {
      const emailKey = this.emailKey(emailNormalized);
      const emailCount = await this.redis.incr(emailKey);
      if (emailCount === 1) await this.redis.expire(emailKey, WINDOW_SECONDS);

      if (ipAddress) {
        const ipKey = this.ipKey(ipAddress);
        const ipCount = await this.redis.incr(ipKey);
        if (ipCount === 1) await this.redis.expire(ipKey, WINDOW_SECONDS);
      }

      if (emailCount >= MAX_FAILURES) {
        return { lockedUntil: new Date(Date.now() + LOCKOUT_SECONDS * 1000) };
      }
    } catch (error) {
      if (!this.isRedisUnavailable(error)) throw error;
    }

    return { lockedUntil: null };
  }

  async reset(emailNormalized: string, ipAddress?: string): Promise<void> {
    try {
      await this.redis.del(this.emailKey(emailNormalized));
      if (ipAddress) await this.redis.del(this.ipKey(ipAddress));
    } catch (error) {
      if (!this.isRedisUnavailable(error)) throw error;
    }
  }
}
