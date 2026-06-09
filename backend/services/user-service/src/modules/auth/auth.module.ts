import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PrismaService } from '../../shared/database/prisma.service';
import { PrismaOutboxEventBusAdapter } from '../../shared/events/prisma-outbox-event-bus.adapter';
import { EVENT_BUS } from '../../shared/events/event-bus.port';
import { Argon2PasswordHasherService } from '../../shared/security/argon2-password-hasher.service';
import { PASSWORD_HASHER } from '../../shared/security/password-hasher.port';
import { TokenService } from '../../shared/security/token.service';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { PrismaAuditLoginLogRepository } from './infrastructure/persistence/prisma-audit-login-log.repository';
import { PrismaIdentityRepository } from './infrastructure/persistence/prisma-identity.repository';
import { PrismaPasswordResetRepository } from './infrastructure/persistence/prisma-password-reset.repository';
import { PrismaSessionRepository } from './infrastructure/persistence/prisma-session.repository';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { PrismaVerificationTokenRepository } from './infrastructure/persistence/prisma-verification-token.repository';
import { RedisLoginRateLimitService } from './infrastructure/services/redis-login-rate-limit.service';
import { AuditLoginLogRepositoryPort, AUDIT_LOGIN_LOG_REPOSITORY } from './domain/ports/audit-login-log.repository.port';
import { IdentityRepositoryPort, IDENTITY_REPOSITORY } from './domain/ports/identity.repository.port';
import { LoginRateLimitServicePort, LOGIN_RATE_LIMIT_SERVICE } from './domain/ports/login-rate-limit.service.port';
import { PasswordResetRepositoryPort, PASSWORD_RESET_REPOSITORY } from './domain/ports/password-reset.repository.port';
import { SessionRepositoryPort, SESSION_REPOSITORY } from './domain/ports/session.repository.port';
import { VerificationTokenRepositoryPort, VERIFICATION_TOKEN_REPOSITORY } from './domain/ports/verification-token.repository.port';
import { USER_REPOSITORY, UserRepositoryPort } from './domain/ports/user.repository.port';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { RefreshSessionUseCase } from './application/use-cases/refresh-session.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { VerifyEmailUseCase } from './application/use-cases/verify-email.use-case';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    PrismaService,
    TokenService,
    RegisterUseCase,
    LoginUseCase,
    RefreshSessionUseCase,
    LogoutUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    VerifyEmailUseCase,
    {
      provide: PASSWORD_HASHER,
      useClass: Argon2PasswordHasherService,
    },
    {
      provide: EVENT_BUS,
      useClass: PrismaOutboxEventBusAdapter,
    },
    {
      provide: IDENTITY_REPOSITORY,
      useClass: PrismaIdentityRepository,
    },
    {
      provide: SESSION_REPOSITORY,
      useClass: PrismaSessionRepository,
    },
    {
      provide: AUDIT_LOGIN_LOG_REPOSITORY,
      useClass: PrismaAuditLoginLogRepository,
    },
    {
      provide: PASSWORD_RESET_REPOSITORY,
      useClass: PrismaPasswordResetRepository,
    },
    {
      provide: VERIFICATION_TOKEN_REPOSITORY,
      useClass: PrismaVerificationTokenRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: LOGIN_RATE_LIMIT_SERVICE,
      useClass: RedisLoginRateLimitService,
    },
    PrismaIdentityRepository,
    PrismaSessionRepository,
    PrismaAuditLoginLogRepository,
    PrismaPasswordResetRepository,
    PrismaVerificationTokenRepository,
    PrismaUserRepository,
    RedisLoginRateLimitService,
    PrismaOutboxEventBusAdapter,
  ],
  exports: [TokenService],
})
export class AuthModule {}
