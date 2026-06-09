import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { TokenService } from '../../../../shared/security/token.service';
import {
  SESSION_REPOSITORY,
  SessionRepositoryPort,
} from '../../domain/ports/session.repository.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/ports/user.repository.port';

@Injectable()
export class RefreshSessionUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    private readonly tokenService: TokenService,
  ) {}

  async execute(
    rawToken: string,
  ): Promise<{ accessToken: string; expiresIn: number; refreshToken: string }> {
    if (!rawToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const tokenHash = this.tokenService.hashToken(rawToken);
    const session = await this.sessionRepository.findByRefreshTokenHash(tokenHash);

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.revokedAt) {
      // Token reuse detected — revoke entire family
      await this.sessionRepository.revokeByFamilyId(session.tokenFamilyId, 'TOKEN_REUSE');
      throw new UnauthorizedException('Refresh token already used');
    }

    if (session.expiresAt < new Date()) {
      await this.sessionRepository.revokeById(session.id, 'EXPIRED');
      throw new UnauthorizedException('Refresh token expired');
    }

    await this.sessionRepository.revokeById(session.id, 'ROTATED');

    const roles = await this.userRepository.findRolesByUserId(session.userId);
    const access = await this.tokenService.issueAccessToken({ sub: session.userId, role: roles });
    const newRefresh = this.tokenService.rotateRefreshToken();

    await this.sessionRepository.create({
      userId: session.userId,
      refreshTokenHash: newRefresh.hash,
      tokenFamilyId: session.tokenFamilyId,
      expiresAt: newRefresh.expiresAt,
    });

    return {
      accessToken: access.token,
      expiresIn: access.expiresIn,
      refreshToken: newRefresh.plain,
    };
  }
}
