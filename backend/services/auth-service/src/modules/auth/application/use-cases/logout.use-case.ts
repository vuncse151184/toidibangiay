import { Inject, Injectable } from '@nestjs/common';

import { TokenService } from '../../../../shared/security/token.service';
import {
  SESSION_REPOSITORY,
  SessionRepositoryPort,
} from '../../domain/ports/session.repository.port';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepositoryPort,
    private readonly tokenService: TokenService,
  ) {}

  async execute(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;

    const tokenHash = this.tokenService.hashToken(rawToken);
    const session = await this.sessionRepository.findByRefreshTokenHash(tokenHash);
    if (session && !session.revokedAt) {
      await this.sessionRepository.revokeById(session.id, 'LOGOUT');
    }
  }
}
