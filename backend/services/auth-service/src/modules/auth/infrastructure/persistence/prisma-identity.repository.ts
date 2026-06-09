import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/database/prisma.service';
import { AuthIdentity } from '../../domain/models/auth-identity';
import { IdentityRepositoryPort } from '../../domain/ports/identity.repository.port';

@Injectable()
export class PrismaIdentityRepository implements IdentityRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(emailNormalized: string): Promise<AuthIdentity | null> {
    const row = await this.prisma.authIdentity.findUnique({
      where: { emailNormalized },
    });
    if (!row) return null;

    return {
      id: row.id,
      userId: row.userId,
      email: row.email,
      emailNormalized: row.emailNormalized,
      passwordHash: row.passwordHash,
      emailVerifiedAt: row.emailVerifiedAt,
      failedLoginCount: row.failedLoginCount,
      lockedUntil: row.lockedUntil,
      lastLoginAt: row.lastLoginAt,
    };
  }

  async create(input: {
    userId: string;
    email: string;
    emailNormalized: string;
    passwordHash: string;
  }): Promise<void> {
    await this.prisma.authIdentity.create({ data: input });
  }

  async markEmailVerified(userId: string): Promise<void> {
    await this.prisma.authIdentity.update({
      where: { userId },
      data: { emailVerifiedAt: new Date() },
    });
  }

  async markLoginSuccess(identityId: string): Promise<void> {
    await this.prisma.authIdentity.update({
      where: { id: identityId },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
    });
  }

  async incrementFailedCount(identityId: string, lockedUntil: Date | null): Promise<void> {
    await this.prisma.authIdentity.update({
      where: { id: identityId },
      data: {
        failedLoginCount: { increment: 1 },
        lockedUntil: lockedUntil ?? undefined,
      },
    });
  }

  async resetFailedCount(identityId: string): Promise<void> {
    await this.prisma.authIdentity.update({
      where: { id: identityId },
      data: { failedLoginCount: 0, lockedUntil: null },
    });
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.authIdentity.update({
      where: { userId },
      data: { passwordHash },
    });
  }
}
