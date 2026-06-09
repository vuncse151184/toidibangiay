import {
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';

import { EVENT_BUS, EventBusPort } from '../../../../shared/events/event-bus.port';
import {
  PASSWORD_HASHER,
  PasswordHasherPort,
} from '../../../../shared/security/password-hasher.port';
import { TokenService } from '../../../../shared/security/token.service';
import { buildUserRegisteredEvent } from '../../domain/events/user-registered.event';
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
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(IDENTITY_REPOSITORY)
    private readonly identityRepository: IdentityRepositoryPort,
    @Inject(VERIFICATION_TOKEN_REPOSITORY)
    private readonly verificationTokenRepository: VerificationTokenRepositoryPort,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBusPort,
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: RegisterDto): Promise<{ userId: string; status: string; verificationToken: string }> {
    const emailNormalized = input.email.trim().toLowerCase();
    const exists = await this.userRepository.existsByEmail(emailNormalized);

    if (exists) {
      throw new ConflictException('Email is already registered');
    }

    const { userId } = await this.userRepository.createUserAggregate({
      fullName: input.fullName.trim(),
    });

    const passwordHash = await this.passwordHasher.hash(input.password);

    await this.identityRepository.createPasswordIdentity({
      userId,
      email: input.email.trim(),
      emailNormalized,
      passwordHash,
    });

    await this.userRepository.assignRoleByCode(userId, 'CUSTOMER');

    const verification = this.tokenService.issueOneTimeToken(24 * 60 * 60);
    await this.verificationTokenRepository.create({
      userId,
      tokenHash: verification.hash,
      expiresAt: verification.expiresAt,
    });

    await this.eventBus.publish(
      buildUserRegisteredEvent({
        userId,
        email: input.email.trim(),
      }),
    );

    return {
      userId,
      status: 'PENDING_VERIFICATION',
      verificationToken: verification.plain,
    };
  }
}
