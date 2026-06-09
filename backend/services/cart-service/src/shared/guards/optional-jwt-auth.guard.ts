import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { env } from '../config/env';
import { AuthenticatedUser } from './jwt-auth.guard';

@Injectable()
export class OptionalJwtAuthGuard {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      user?: AuthenticatedUser;
      sessionId?: string;
    }>();

    const authorization = request.headers['authorization'];
    const sessionId = request.headers['x-session-id'];

    if (authorization?.startsWith('Bearer ')) {
      try {
        const token = authorization.slice('Bearer '.length);
        const payload = await this.jwtService.verifyAsync<{
          sub: string;
          role: string[];
          jti: string;
        }>(token, { secret: env.JWT_ACCESS_SECRET });
        request.user = { userId: payload.sub, roles: payload.role, jti: payload.jti };
      } catch {
        // invalid token = treat as guest
      }
    }

    if (!request.user && sessionId) {
      request.sessionId = sessionId;
    }

    return true;
  }
}
