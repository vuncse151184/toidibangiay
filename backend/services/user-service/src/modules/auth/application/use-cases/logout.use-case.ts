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

  async execute(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    const hash = this.tokenService.hashOpaqueToken(refreshToken);
    const session = await this.sessionRepository.findByRefreshTokenHash(hash);

    if (!session) {
      return;
    }

    await this.sessionRepository.revokeById(session.id, 'LOGOUT');
  }
}
