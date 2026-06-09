import { createHash, randomBytes, randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { env } from '../config/env';
import { AccessTokenPayload } from './jwt-payload.type';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async issueAccessToken(payload: Omit<AccessTokenPayload, 'jti'>): Promise<{
    token: string;
    expiresIn: number;
    jti: string;
  }> {
    const jti = randomUUID();
    const token = await this.jwtService.signAsync(
      { ...payload, jti },
      { secret: env.JWT_ACCESS_SECRET, expiresIn: env.JWT_ACCESS_TTL_SECONDS },
    );
    return { token, expiresIn: env.JWT_ACCESS_TTL_SECONDS, jti };
  }

  issueRefreshToken(): { plain: string; hash: string; familyId: string; expiresAt: Date } {
    const plain = randomBytes(48).toString('base64url');
    return {
      plain,
      hash: this.hashToken(plain),
      familyId: randomUUID(),
      expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86_400_000),
    };
  }

  rotateRefreshToken(): { plain: string; hash: string; expiresAt: Date } {
    const plain = randomBytes(48).toString('base64url');
    return {
      plain,
      hash: this.hashToken(plain),
      expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86_400_000),
    };
  }

  issueOneTimeToken(ttlSeconds: number): { plain: string; hash: string; expiresAt: Date } {
    const plain = randomBytes(48).toString('base64url');
    return {
      plain,
      hash: this.hashToken(plain),
      expiresAt: new Date(Date.now() + ttlSeconds * 1000),
    };
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
