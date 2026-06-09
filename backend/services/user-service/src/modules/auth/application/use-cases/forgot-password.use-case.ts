import { Inject, Injectable } from '@nestjs/common';

import { TokenService } from '../../../../shared/security/token.service';
import {
  PASSWORD_RESET_REPOSITORY,
  PasswordResetRepositoryPort,
} from '../../domain/ports/password-reset.repository.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/ports/user.repository.port';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(PASSWORD_RESET_REPOSITORY)
    private readonly passwordResetRepository: PasswordResetRepositoryPort,
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: ForgotPasswordDto): Promise<{
    message: string;
    resetToken?: string;
  }> {
    const emailNormalized = input.email.trim().toLowerCase();
    const user = await this.userRepository.findUserByEmail(emailNormalized);

    if (!user) {
      return {
        message: 'If the account exists, a reset link has been sent.',
      };
    }

    const token = this.tokenService.issueOneTimeToken(15 * 60);
    await this.passwordResetRepository.create({
      userId: user.userId,
      tokenHash: token.hash,
      expiresAt: token.expiresAt,
    });

    return {
      message: 'If the account exists, a reset link has been sent.',
      resetToken: token.plain,
    };
  }
}
