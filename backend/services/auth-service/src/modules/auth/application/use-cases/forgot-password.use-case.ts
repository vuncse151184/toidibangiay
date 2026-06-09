import { Inject, Injectable } from '@nestjs/common';

import { TokenService } from '../../../../shared/security/token.service';
import {
  IDENTITY_REPOSITORY,
  IdentityRepositoryPort,
} from '../../domain/ports/identity.repository.port';
import {
  PASSWORD_RESET_REPOSITORY,
  PasswordResetRepositoryPort,
} from '../../domain/ports/password-reset.repository.port';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(IDENTITY_REPOSITORY)
    private readonly identityRepository: IdentityRepositoryPort,
    @Inject(PASSWORD_RESET_REPOSITORY)
    private readonly passwordResetRepository: PasswordResetRepositoryPort,
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<{ message: string; resetToken?: string }> {
    const emailNormalized = dto.email.trim().toLowerCase();
    const identity = await this.identityRepository.findByEmail(emailNormalized);

    // Always return the same message to prevent email enumeration
    if (!identity) {
      return { message: 'If your email is registered you will receive a reset link' };
    }

    const reset = this.tokenService.issueOneTimeToken(15 * 60);
    await this.passwordResetRepository.create({
      userId: identity.userId,
      tokenHash: reset.hash,
      expiresAt: reset.expiresAt,
    });

    // In production: send email. Returned here for dev/testing convenience.
    return {
      message: 'If your email is registered you will receive a reset link',
      resetToken: reset.plain,
    };
  }
}
