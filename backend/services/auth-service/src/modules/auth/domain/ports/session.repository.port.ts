import { AuthSession } from '../models/auth-session';

export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');

export interface SessionRepositoryPort {
  create(input: {
    userId: string;
    refreshTokenHash: string;
    tokenFamilyId: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void>;
  findByRefreshTokenHash(hash: string): Promise<AuthSession | null>;
  revokeById(sessionId: string, reason: string): Promise<void>;
  revokeByFamilyId(familyId: string, reason: string): Promise<void>;
  revokeAllByUserId(userId: string, reason: string): Promise<void>;
}
