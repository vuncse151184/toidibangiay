import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';

import {
  PASSWORD_HASHER,
  PasswordHasherPort,
} from '../../../../shared/security/password-hasher.port';
import { TokenService } from '../../../../shared/security/token.service';
import {
  IDENTITY_REPOSITORY,
  IdentityRepositoryPort,
} from '../../domain/ports/identity.repository.port';
import {
  PASSWORD_RESET_REPOSITORY,
  PasswordResetRepositoryPort,
} from '../../domain/ports/password-reset.repository.port';
import {
  SESSION_REPOSITORY,
  SessionRepositoryPort,
} from '../../domain/ports/session.repository.port';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(PASSWORD_RESET_REPOSITORY)
    private readonly passwordResetRepository: PasswordResetRepositoryPort,
    @Inject(IDENTITY_REPOSITORY)
    private readonly identityRepository: IdentityRepositoryPort,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepositoryPort,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: ResetPasswordDto): Promise<{ message: string }> {
    const tokenHash = this.tokenService.hashOpaqueToken(input.token);
    const resetRecord = await this.passwordResetRepository.findByTokenHash(tokenHash);

    if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt <= new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await this.passwordHasher.hash(input.newPassword);
    await this.identityRepository.updatePassword(resetRecord.userId, passwordHash);
    await this.sessionRepository.revokeAllByUserId(
      resetRecord.userId,
      'PASSWORD_RESET',
    );
    await this.passwordResetRepository.markUsed(resetRecord.id);

    return {
      message: 'Password updated successfully',
    };
  }
}
