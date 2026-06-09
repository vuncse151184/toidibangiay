import { ConflictException, Inject, Injectable } from '@nestjs/common';

import {
  PASSWORD_HASHER,
  PasswordHasherPort,
} from '../../../../shared/security/password-hasher.port';
import { env } from '../../../../shared/config/env';
import {
  EMAIL_SENDER,
  EmailSenderPort,
} from '../../../../shared/email/email-sender.port';
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
    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSenderPort,
    private readonly tokenService: TokenService,
  ) {}

  async execute(
    dto: RegisterDto,
  ): Promise<{ userId: string; status: string; verificationToken: string }> {
    const emailNormalized = dto.email.trim().toLowerCase();

    if (await this.userRepository.existsByEmail(emailNormalized)) {
      throw new ConflictException('Email already registered');
    }

    const { userId } = await this.userRepository.createUser({
      fullName: dto.fullName.trim(),
    });

    const passwordHash = await this.passwordHasher.hash(dto.password);
    await this.identityRepository.create({
      userId,
      email: dto.email.trim(),
      emailNormalized,
      passwordHash,
    });

    // Development: auto-activate immediately, no email needed
    // if (env.NODE_ENV === 'development') {
    //   await this.userRepository.activateUser(userId);
    //   return { userId, status: 'ACTIVE', verificationToken: '' };
    // }

    const verification = this.tokenService.issueOneTimeToken(24 * 60 * 60);
    await this.verificationTokenRepository.create({
      userId,
      tokenHash: verification.hash,
      expiresAt: verification.expiresAt,
    });

    const verificationUrl = `${env.FRONTEND_URL.replace(/\/$/, '')}/verify-email?token=${encodeURIComponent(
      verification.plain,
    )}`;

    await this.emailSender.sendEmail({
      to: dto.email.trim(),
      subject: 'Activate your Shoe Store account',
      text: `Welcome ${dto.fullName.trim()}.\n\nActivate your account here:\n${verificationUrl}\n\nThis link expires in 24 hours.`,
      html: `
        <p>Welcome ${escapeHtml(dto.fullName.trim())}.</p>
        <p>Activate your account by clicking the link below:</p>
        <p><a href="${verificationUrl}">Activate account</a></p>
        <p>This link expires in 24 hours.</p>
      `,
    });

    return { userId, status: 'PENDING_VERIFICATION', verificationToken: verification.plain };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
