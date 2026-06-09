import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/database/prisma.service';
import {
  CreateSessionInput,
  SessionRepositoryPort,
} from '../../domain/ports/session.repository.port';
import { UserSessionModel } from '../../domain/models/user-session';

@Injectable()
export class PrismaSessionRepository implements SessionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateSessionInput): Promise<{ sessionId: string }> {
    const session = await this.prisma.userSession.create({
      data: {
        userId: input.userId,
        refreshTokenHash: input.refreshTokenHash,
        tokenFamilyId: input.tokenFamilyId,
        userAgent: input.userAgent,
        ipAddress: input.ipAddress,
        expiresAt: input.expiresAt,
        rotatedFromSessionId: input.rotatedFromSessionId,
      },
    });

    return { sessionId: session.id };
  }

  async findByRefreshTokenHash(refreshTokenHash: string): Promise<UserSessionModel | null> {
    const session = await this.prisma.userSession.findFirst({
      where: {
        refreshTokenHash,
      },
    });

    if (!session) {
      return null;
    }

    return {
      id: session.id,
      userId: session.userId,
      refreshTokenHash: session.refreshTokenHash,
      tokenFamilyId: session.tokenFamilyId,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,
    };
  }

  async revokeById(sessionId: string, reason: string): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: {
        id: sessionId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });
  }

  async revokeByFamilyId(tokenFamilyId: string, reason: string): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: {
        tokenFamilyId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });
  }

  async revokeAllByUserId(userId: string, reason: string): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });
  }
}
