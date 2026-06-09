import { AuthIdentity } from '../models/auth-identity';

export const IDENTITY_REPOSITORY = Symbol('IDENTITY_REPOSITORY');

export interface IdentityRepositoryPort {
  findByEmail(emailNormalized: string): Promise<AuthIdentity | null>;
  create(input: {
    userId: string;
    email: string;
    emailNormalized: string;
    passwordHash: string;
  }): Promise<void>;
  markEmailVerified(userId: string): Promise<void>;
  markLoginSuccess(identityId: string): Promise<void>;
  incrementFailedCount(identityId: string, lockedUntil: Date | null): Promise<void>;
  resetFailedCount(identityId: string): Promise<void>;
  updatePasswordHash(userId: string, passwordHash: string): Promise<void>;
}
