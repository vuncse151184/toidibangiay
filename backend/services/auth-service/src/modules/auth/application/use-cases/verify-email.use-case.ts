import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { TokenService } from '../../../../shared/security/token.service';
import {
  IDENTITY_REPOSITORY,
  IdentityRepositoryPort,
} from '../../domain/ports/identity.repository.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/ports/user.repository.port';
import {
  VERIFICATION_TOKEN_REPOSITORY,
  VerificationTokenRepositoryPort,
} from '../../domain/ports/verification-token.repository.port';
import { VerifyEmailDto } from '../dto/verify-email.dto';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    @Inject(VERIFICATION_TOKEN_REPOSITORY)
    private readonly verificationTokenRepository: VerificationTokenRepositoryPort,
    @Inject(IDENTITY_REPOSITORY)
    private readonly identityRepository: IdentityRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: VerifyEmailDto): Promise<{ message: string }> {
    const tokenHash = this.tokenService.hashToken(dto.token);
    const record = await this.verificationTokenRepository.findByTokenHash(tokenHash);

    if (!record) {
      throw new NotFoundException('Invalid verification token');
    }
    if (record.usedAt) {
      throw new BadRequestException('Verification token already used');
    }
    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Verification token expired');
    }

    await this.identityRepository.markEmailVerified(record.userId);
    await this.userRepository.activateUser(record.userId);
    await this.verificationTokenRepository.markUsed(record.id);

    return { message: 'Email verified successfully' };
  }
}
