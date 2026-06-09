import { AuthIdentity } from '../models/auth-identity';

export const IDENTITY_REPOSITORY = Symbol('IDENTITY_REPOSITORY');

export interface CreatePasswordIdentityInput {
  userId: string;
  email: string;
  emailNormalized: string;
  passwordHash: string;
}

export interface IdentityRepositoryPort {
  findPasswordIdentityByEmail(emailNormalized: string): Promise<AuthIdentity | null>;
  createPasswordIdentity(input: CreatePasswordIdentityInput): Promise<void>;
  markLoginSuccess(identityId: string): Promise<void>;
  incrementFailedCount(identityId: string, lockedUntil: Date | null): Promise<void>;
  resetFailedCount(identityId: string): Promise<void>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
  markEmailVerified(userId: string): Promise<void>;
}
