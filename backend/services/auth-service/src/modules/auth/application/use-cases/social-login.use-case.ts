import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { TokenService } from '../../../../shared/security/token.service';
import {
  SESSION_REPOSITORY,
  SessionRepositoryPort,
} from '../../domain/ports/session.repository.port';
import {
  SOCIAL_IDENTITY_REPOSITORY,
  SocialIdentityRepositoryPort,
} from '../../domain/ports/social-identity.repository.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/ports/user.repository.port';
import { SocialLoginDto } from '../dto/social-login.dto';

interface OAuthProfile {
  providerId: string;
  email?: string;
  name?: string;
}

@Injectable()
export class SocialLoginUseCase {
  constructor(
    @Inject(SOCIAL_IDENTITY_REPOSITORY)
    private readonly socialIdentityRepo: SocialIdentityRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepositoryPort,
    private readonly tokenService: TokenService,
  ) {}

  async execute(
    dto: SocialLoginDto,
    meta: { ipAddress?: string; userAgent?: string },
  ): Promise<{
    accessToken: string;
    expiresIn: number;
    refreshToken: string;
    user: { id: string; email: string; roles: string[] };
  }> {
    const profile = await this.verifyWithProvider(dto.provider, dto.token);

    const existing = await this.socialIdentityRepo.findByProviderAndProviderId(
      dto.provider,
      profile.providerId,
    );

    let userId: string;

    if (existing) {
      userId = existing.userId;
    } else {
      const emailNormalized = profile.email?.trim().toLowerCase() ?? null;
      const linkedUserId = emailNormalized
        ? await this.userRepository.findUserIdByEmail(emailNormalized)
        : null;

      if (linkedUserId) {
        userId = linkedUserId;
      } else {
        const { userId: newId } = await this.userRepository.createUser({
          fullName: profile.name ?? '',
        });
        await this.userRepository.activateUser(newId);
        userId = newId;
      }

      await this.socialIdentityRepo.create({
        userId,
        provider: dto.provider,
        providerId: profile.providerId,
        email: profile.email ?? null,
        displayName: profile.name ?? null,
      });
    }

    const roles = await this.userRepository.findRolesByUserId(userId);
    const access = await this.tokenService.issueAccessToken({
      sub: userId,
      role: roles,
    });
    const refresh = this.tokenService.issueRefreshToken();

    await this.sessionRepository.create({
      userId,
      refreshTokenHash: refresh.hash,
      tokenFamilyId: refresh.familyId,
      expiresAt: refresh.expiresAt,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return {
      accessToken: access.token,
      expiresIn: access.expiresIn,
      refreshToken: refresh.plain,
      user: { id: userId, email: profile.email ?? '', roles },
    };
  }

  private async verifyWithProvider(
    provider: 'google' | 'facebook',
    token: string,
  ): Promise<OAuthProfile> {
    return provider === 'google'
      ? this.verifyGoogle(token)
      : this.verifyFacebook(token);
  }

  private async verifyGoogle(accessToken: string): Promise<OAuthProfile> {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      throw new UnauthorizedException('Invalid Google token');
    }
    const data = (await res.json()) as {
      sub?: string;
      email?: string;
      name?: string;
    };
    if (!data.sub) {
      throw new UnauthorizedException('Invalid Google token');
    }
    return { providerId: data.sub, email: data.email, name: data.name };
  }

  private async verifyFacebook(accessToken: string): Promise<OAuthProfile> {
    const url = `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`;
    const res = await fetch(url);
    const data = (await res.json()) as {
      id?: string;
      name?: string;
      email?: string;
      error?: { message: string };
    };
    if (data.error || !data.id) {
      throw new UnauthorizedException('Invalid Facebook token');
    }
    return { providerId: data.id, email: data.email, name: data.name };
  }
}
