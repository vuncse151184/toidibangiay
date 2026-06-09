export const VERIFICATION_TOKEN_REPOSITORY = Symbol('VERIFICATION_TOKEN_REPOSITORY');

export interface VerificationTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
}

export interface VerificationTokenRepositoryPort {
  create(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<VerificationTokenRecord | null>;
  markUsed(id: string): Promise<void>;
}
