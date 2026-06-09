export const VERIFICATION_TOKEN_REPOSITORY = Symbol('VERIFICATION_TOKEN_REPOSITORY');

export interface CreateVerificationTokenInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface VerificationTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
}

export interface VerificationTokenRepositoryPort {
  create(input: CreateVerificationTokenInput): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<VerificationTokenRecord | null>;
  markUsed(id: string): Promise<void>;
}
