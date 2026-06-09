export interface AuthIdentity {
  id: string;
  userId: string;
  email: string;
  emailNormalized: string;
  passwordHash: string | null;
  emailVerifiedAt: Date | null;
  failedLoginCount: number;
  lockedUntil: Date | null;
  lastLoginAt: Date | null;
}
