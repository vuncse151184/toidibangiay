import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  PASSWORD_HASHER,
  PasswordHasherPort,
} from '../../../../shared/security/password-hasher.port';
import { TokenService } from '../../../../shared/security/token.service';
import {
  AUDIT_LOG_REPOSITORY,
  AuditLogRepositoryPort,
} from '../../domain/ports/audit-log.repository.port';
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
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly auditLogRepository: AuditLogRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(LOGIN_RATE_LIMIT_SERVICE)
    private readonly rateLimitService: LoginRateLimitServicePort,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenService: TokenService,
  ) {}

  async execute(
    dto: LoginDto,
    meta: { ipAddress?: string; userAgent?: string },
  ): Promise<{
    accessToken: string;
    expiresIn: number;
    refreshToken: string;
    user: { id: string; email: string; roles: string[] };
  }> {
    const emailNormalized = dto.email.trim().toLowerCase();

    await this.rateLimitService.assertNotRateLimited(emailNormalized, meta.ipAddress);

    const identity = await this.identityRepository.findByEmail(emailNormalized);

    if (!identity || !identity.passwordHash) {
      await this.auditLogRepository.logFailure({
        identityEmail: emailNormalized,
        failureReason: 'INVALID_CREDENTIALS',
        ...meta,
      });
      await this.rateLimitService.registerFailure(emailNormalized, meta.ipAddress);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (identity.lockedUntil && identity.lockedUntil > new Date()) {
      await this.auditLogRepository.logFailure({
        userId: identity.userId,
        identityEmail: emailNormalized,
        failureReason: 'ACCOUNT_LOCKED',
        ...meta,
      });
      throw new ForbiddenException('Account temporarily locked');
    }

    const passwordMatched = await this.passwordHasher.verify(
      identity.passwordHash,
      dto.password,
    );

    if (!passwordMatched) {
      const result = await this.rateLimitService.registerFailure(emailNormalized, meta.ipAddress);
      await this.identityRepository.incrementFailedCount(identity.id, result.lockedUntil);
      await this.auditLogRepository.logFailure({
        userId: identity.userId,
        identityEmail: emailNormalized,
        failureReason: result.lockedUntil ? 'ACCOUNT_LOCKED' : 'INVALID_CREDENTIALS',
        ...meta,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.identityRepository.markLoginSuccess(identity.id);
    await this.rateLimitService.reset(emailNormalized, meta.ipAddress);

    const roles = await this.userRepository.findRolesByUserId(identity.userId);
    const access = await this.tokenService.issueAccessToken({ sub: identity.userId, role: roles });
    const refresh = this.tokenService.issueRefreshToken();

    await this.sessionRepository.create({
      userId: identity.userId,
      refreshTokenHash: refresh.hash,
      tokenFamilyId: refresh.familyId,
      expiresAt: refresh.expiresAt,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    await this.auditLogRepository.logSuccess({
      userId: identity.userId,
      identityEmail: identity.emailNormalized,
      ...meta,
    });

    return {
      accessToken: access.token,
      expiresIn: access.expiresIn,
      refreshToken: refresh.plain,
      user: { id: identity.userId, email: identity.email, roles },
    };
  }
}
