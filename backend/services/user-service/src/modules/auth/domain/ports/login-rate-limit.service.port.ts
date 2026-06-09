export const LOGIN_RATE_LIMIT_SERVICE = Symbol('LOGIN_RATE_LIMIT_SERVICE');

export interface LoginRateLimitResult {
  lockedUntil: Date | null;
}

export interface LoginRateLimitServicePort {
  assertNotRateLimited(emailNormalized: string, ipAddress?: string): Promise<void>;
  registerFailure(emailNormalized: string, ipAddress?: string): Promise<LoginRateLimitResult>;
  reset(emailNormalized: string, ipAddress?: string): Promise<void>;
}
