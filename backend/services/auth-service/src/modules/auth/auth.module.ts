import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { Argon2PasswordHasherService } from '../../shared/security/argon2-password-hasher.service';
import { PASSWORD_HASHER } from '../../shared/security/password-hasher.port';
import { TokenService } from '../../shared/security/token.service';
import { EMAIL_SENDER } from '../../shared/email/email-sender.port';
import { SmtpEmailSenderService } from '../../shared/email/smtp-email-sender.service';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshSessionUseCase } from './application/use-cases/refresh-session.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { VerifyEmailUseCase } from './application/use-cases/verify-email.use-case';
import { IDENTITY_REPOSITORY } from './domain/ports/identity.repository.port';
import { SESSION_REPOSITORY } from './domain/ports/session.repository.port';
import { USER_REPOSITORY } from './domain/ports/user.repository.port';
import { PASSWORD_RESET_REPOSITORY } from './domain/ports/password-reset.repository.port';
import { VERIFICATION_TOKEN_REPOSITORY } from './domain/ports/verification-token.repository.port';
import { LOGIN_RATE_LIMIT_SERVICE } from './domain/ports/login-rate-limit.service.port';
import { AUDIT_LOG_REPOSITORY } from './domain/ports/audit-log.repository.port';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { PrismaIdentityRepository } from './infrastructure/persistence/prisma-identity.repository';
import { PrismaSessionRepository } from './infrastructure/persistence/prisma-session.repository';
import { PrismaPasswordResetRepository } from './infrastructure/persistence/prisma-password-reset.repository';
import { PrismaVerificationTokenRepository } from './infrastructure/persistence/prisma-verification-token.repository';
import { PrismaAuditLogRepository } from './infrastructure/persistence/prisma-audit-log.repository';
import { RedisRateLimitService } from './infrastructure/services/redis-rate-limit.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    TokenService,
    RegisterUseCase,
    LoginUseCase,
    RefreshSessionUseCase,
    LogoutUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    VerifyEmailUseCase,
    { provide: EMAIL_SENDER, useClass: SmtpEmailSenderService },
    { provide: PASSWORD_HASHER, useClass: Argon2PasswordHasherService },
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: IDENTITY_REPOSITORY, useClass: PrismaIdentityRepository },
    { provide: SESSION_REPOSITORY, useClass: PrismaSessionRepository },
    { provide: PASSWORD_RESET_REPOSITORY, useClass: PrismaPasswordResetRepository },
    { provide: VERIFICATION_TOKEN_REPOSITORY, useClass: PrismaVerificationTokenRepository },
    { provide: AUDIT_LOG_REPOSITORY, useClass: PrismaAuditLogRepository },
    { provide: LOGIN_RATE_LIMIT_SERVICE, useClass: RedisRateLimitService },
  ],
})
export class AuthModule {}
