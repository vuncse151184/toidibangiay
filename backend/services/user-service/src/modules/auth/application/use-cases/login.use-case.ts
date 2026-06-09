import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { EVENT_BUS, EventBusPort } from '../../../../shared/events/event-bus.port';
import {
  PASSWORD_HASHER,
  PasswordHasherPort,
} from '../../../../shared/security/password-hasher.port';
import { TokenService } from '../../../../shared/security/token.service';
import { buildUserLockedEvent } from '../../domain/events/user-locked.event';
import {
  AUDIT_LOGIN_LOG_REPOSITORY,
  AuditLoginLogRepositoryPort,
} from '../../domain/ports/audit-login-log.repository.port';
import {
  IDENTITY_REPOSITORY,
  IdentityRepositoryPort,
} from '../../domain/ports/identity.repository.port';
import {
  LOGIN_RATE_LIMIT_SERVICE,
  LoginRateLimitServicePort,
} from '../../domain/ports/login-rate-limit.service.port';
import {
  SESSION_REPOSITORY,
  SessionRepositoryPort,
} from '../../domain/ports/session.repository.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/ports/user.repository.port';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(IDENTITY_REPOSITORY)
    private readonly identityRepository: IdentityRepositoryPort,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepositoryPort,
    @Inject(AUDIT_LOGIN_LOG_REPOSITORY)
    private readonly auditLogRepository: AuditLoginLogRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(LOGIN_RATE_LIMIT_SERVICE)
    private readonly loginRateLimitService: LoginRateLimitServicePort,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBusPort,
    private readonly tokenService: TokenService,
  ) {}

  async execute(
    input: LoginDto,
    metadata: {
      ipAddress?: string;
      userAgent?: string;
    },
  ): Promise<{
    accessToken: string;
    expiresIn: number;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      roles: string[];
    };
  }> {
    const emailNormalized = input.email.trim().toLowerCase();

    await this.loginRateLimitService.assertNotRateLimited(
      emailNormalized,
      metadata.ipAddress,
    );

    const identity =
      await this.identityRepository.findPasswordIdentityByEmail(emailNormalized);

    if (!identity || !identity.passwordHash) {
      await this.auditLogRepository.createFail({
        identityEmail: emailNormalized,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        failureReason: 'INVALID_CREDENTIALS',
      });
      await this.loginRateLimitService.registerFailure(
        emailNormalized,
        metadata.ipAddress,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    if (identity.lockedUntil && identity.lockedUntil > new Date()) {
      await this.auditLogRepository.createFail({
        userId: identity.userId,
        identityEmail: emailNormalized,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        failureReason: 'LOCKED',
      });
      throw new ForbiddenException('Account temporarily locked');
    }

    const passwordMatched = await this.passwordHasher.verify(
      identity.passwordHash,
      input.password,
    );

    if (!passwordMatched) {
      const result = await this.loginRateLimitService.registerFailure(
        emailNormalized,
        metadata.ipAddress,
      );

      await this.identityRepository.incrementFailedCount(identity.id, result.lockedUntil);

      if (result.lockedUntil) {
        await this.eventBus.publish(
          buildUserLockedEvent({
            userId: identity.userId,
            lockedUntil: result.lockedUntil,
          }),
        );
      }

      await this.auditLogRepository.createFail({
        userId: identity.userId,
        identityEmail: emailNormalized,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        failureReason: result.lockedUntil ? 'LOCKED' : 'INVALID_CREDENTIALS',
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    await this.identityRepository.markLoginSuccess(identity.id);
    await this.loginRateLimitService.reset(emailNormalized, metadata.ipAddress);

    const roles = await this.userRepository.findRolesByUserId(identity.userId);
    const access = await this.tokenService.issueAccessToken({
      sub: identity.userId,
      role: roles,
    });
    const refresh = this.tokenService.issueRefreshToken();

    await this.sessionRepository.create({
      userId: identity.userId,
      refreshTokenHash: refresh.hash,
      tokenFamilyId: refresh.familyId,
      expiresAt: refresh.expiresAt,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });

    await this.auditLogRepository.createSuccess({
      userId: identity.userId,
      identityEmail: identity.emailNormalized,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });

    return {
      accessToken: access.token,
      expiresIn: access.expiresIn,
      refreshToken: refresh.plain,
      user: {
        id: identity.userId,
        email: identity.email,
        roles,
      },
    };
  }
}
