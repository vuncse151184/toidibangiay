import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
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

  async execute(dto: ResetPasswordDto): Promise<{ message: string }> {
    const tokenHash = this.tokenService.hashToken(dto.token);
    const record = await this.passwordResetRepository.findByTokenHash(tokenHash);

    if (!record) {
      throw new NotFoundException('Invalid or expired reset token');
    }
    if (record.usedAt) {
      throw new BadRequestException('Reset token already used');
    }
    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Reset token expired');
    }

    const newHash = await this.passwordHasher.hash(dto.newPassword);
    await this.identityRepository.updatePasswordHash(record.userId, newHash);
    await this.passwordResetRepository.markUsed(record.id);
    await this.sessionRepository.revokeAllByUserId(record.userId, 'PASSWORD_RESET');

    return { message: 'Password reset successfully' };
  }
}
