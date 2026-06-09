import { UserSessionModel } from '../models/user-session';

export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');

export interface CreateSessionInput {
  userId: string;
  refreshTokenHash: string;
  tokenFamilyId: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  rotatedFromSessionId?: string;
}

export interface SessionRepositoryPort {
  create(input: CreateSessionInput): Promise<{ sessionId: string }>;
  findByRefreshTokenHash(refreshTokenHash: string): Promise<UserSessionModel | null>;
  revokeById(sessionId: string, reason: string): Promise<void>;
  revokeByFamilyId(tokenFamilyId: string, reason: string): Promise<void>;
  revokeAllByUserId(userId: string, reason: string): Promise<void>;
}
