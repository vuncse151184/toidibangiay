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

  async execute(refreshToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
    refreshToken: string;
  }> {
    const refreshTokenHash = this.tokenService.hashOpaqueToken(refreshToken);
    const currentSession =
      await this.sessionRepository.findByRefreshTokenHash(refreshTokenHash);

    if (!currentSession) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (currentSession.revokedAt) {
      await this.sessionRepository.revokeByFamilyId(
        currentSession.tokenFamilyId,
        'REUSE_DETECTED',
      );
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    if (currentSession.expiresAt <= new Date()) {
      await this.sessionRepository.revokeById(currentSession.id, 'EXPIRED');
      throw new UnauthorizedException('Refresh token expired');
    }

    const roles = await this.userRepository.findRolesByUserId(currentSession.userId);
    const access = await this.tokenService.issueAccessToken({
      sub: currentSession.userId,
      role: roles,
    });
    const rotated = this.tokenService.rotateRefreshToken();

    await this.sessionRepository.revokeById(currentSession.id, 'ROTATED');
    await this.sessionRepository.create({
      userId: currentSession.userId,
      refreshTokenHash: rotated.hash,
      tokenFamilyId: currentSession.tokenFamilyId,
      expiresAt: rotated.expiresAt,
      rotatedFromSessionId: currentSession.id,
    });

    return {
      accessToken: access.token,
      expiresIn: access.expiresIn,
      refreshToken: rotated.plain,
    };
  }
}
