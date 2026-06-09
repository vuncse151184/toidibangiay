import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/database/prisma.service';
import { AuthSession } from '../../domain/models/auth-session';
import { SessionRepositoryPort } from '../../domain/ports/session.repository.port';

@Injectable()
export class PrismaSessionRepository implements SessionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: {
    userId: string;
    refreshTokenHash: string;
    tokenFamilyId: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.prisma.authSession.create({ data: input });
  }

  async findByRefreshTokenHash(hash: string): Promise<AuthSession | null> {
    const row = await this.prisma.authSession.findFirst({
      where: { refreshTokenHash: hash },
    });
    if (!row) return null;

    return {
      id: row.id,
      userId: row.userId,
      refreshTokenHash: row.refreshTokenHash,
      tokenFamilyId: row.tokenFamilyId,
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt,
    };
  }

  async revokeById(sessionId: string, reason: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { id: sessionId },
      data: { revokedAt: new Date(), revokeReason: reason },
    });
  }

  async revokeByFamilyId(familyId: string, reason: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { tokenFamilyId: familyId, revokedAt: null },
      data: { revokedAt: new Date(), revokeReason: reason },
    });
  }

  async revokeAllByUserId(userId: string, reason: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date(), revokeReason: reason },
    });
  }
}
