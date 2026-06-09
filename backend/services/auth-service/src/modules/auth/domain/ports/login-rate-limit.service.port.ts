export const LOGIN_RATE_LIMIT_SERVICE = Symbol('LOGIN_RATE_LIMIT_SERVICE');

export interface LoginRateLimitServicePort {
  assertNotRateLimited(emailNormalized: string, ipAddress?: string): Promise<void>;
  registerFailure(emailNormalized: string, ipAddress?: string): Promise<{ lockedUntil: Date | null }>;
  reset(emailNormalized: string, ipAddress?: string): Promise<void>;
}
