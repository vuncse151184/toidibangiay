import { Injectable } from '@nestjs/common';
import { IdentityProvider, PasswordAlgo } from '@prisma/client';

import { PrismaService } from '../../../../shared/database/prisma.service';
import {
  CreatePasswordIdentityInput,
  IdentityRepositoryPort,
} from '../../domain/ports/identity.repository.port';
import { AuthIdentity } from '../../domain/models/auth-identity';

@Injectable()
export class PrismaIdentityRepository implements IdentityRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findPasswordIdentityByEmail(emailNormalized: string): Promise<AuthIdentity | null> {
    const identity = await this.prisma.userIdentity.findUnique({
      where: {
        provider_emailNormalized: {
          provider: IdentityProvider.PASSWORD,
          emailNormalized,
        },
      },
    });

    if (!identity) {
      return null;
    }

    return {
      id: identity.id,
      userId: identity.userId,
      email: identity.email,
      emailNormalized: identity.emailNormalized,
      passwordHash: identity.passwordHash,
      emailVerifiedAt: identity.emailVerifiedAt,
      failedLoginCount: identity.failedLoginCount,
      lockedUntil: identity.lockedUntil,
    };
  }

  async createPasswordIdentity(input: CreatePasswordIdentityInput): Promise<void> {
    await this.prisma.userIdentity.create({
      data: {
        userId: input.userId,
        provider: IdentityProvider.PASSWORD,
        email: input.email,
        emailNormalized: input.emailNormalized,
        passwordHash: input.passwordHash,
        passwordAlgo: PasswordAlgo.ARGON2ID,
      },
    });
  }

  async markLoginSuccess(identityId: string): Promise<void> {
    await this.prisma.userIdentity.update({
      where: { id: identityId },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });
  }

  async incrementFailedCount(identityId: string, lockedUntil: Date | null): Promise<void> {
    await this.prisma.userIdentity.update({
      where: { id: identityId },
      data: {
        failedLoginCount: {
          increment: 1,
        },
        lockedUntil,
      },
    });
  }

  async resetFailedCount(identityId: string): Promise<void> {
    await this.prisma.userIdentity.update({
      where: { id: identityId },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
      },
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.userIdentity.updateMany({
      where: {
        userId,
        provider: IdentityProvider.PASSWORD,
      },
      data: {
        passwordHash,
        passwordAlgo: PasswordAlgo.ARGON2ID,
        failedLoginCount: 0,
        lockedUntil: null,
      },
    });
  }

  async markEmailVerified(userId: string): Promise<void> {
    await this.prisma.userIdentity.updateMany({
      where: {
        userId,
        provider: IdentityProvider.PASSWORD,
      },
      data: {
        emailVerifiedAt: new Date(),
      },
    });
  }
}
