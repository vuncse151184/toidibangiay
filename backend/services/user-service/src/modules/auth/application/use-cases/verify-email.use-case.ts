import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { EVENT_BUS, EventBusPort } from '../../../../shared/events/event-bus.port';
import { TokenService } from '../../../../shared/security/token.service';
import { buildUserVerifiedEvent } from '../../domain/events/user-verified.event';
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
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBusPort,
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: VerifyEmailDto): Promise<{ message: string }> {
    const tokenHash = this.tokenService.hashOpaqueToken(input.token);
    const tokenRecord = await this.verificationTokenRepository.findByTokenHash(
      tokenHash,
    );

    if (!tokenRecord || tokenRecord.usedAt || tokenRecord.expiresAt <= new Date()) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.identityRepository.markEmailVerified(tokenRecord.userId);
    await this.userRepository.activateUser(tokenRecord.userId);
    await this.verificationTokenRepository.markUsed(tokenRecord.id);

    const email = await this.userRepository.findPrimaryEmailByUserId(tokenRecord.userId);
    await this.eventBus.publish(
      buildUserVerifiedEvent({
        userId: tokenRecord.userId,
        email: email ?? '',
      }),
    );

    return {
      message: 'Email verified successfully',
    };
  }
}
