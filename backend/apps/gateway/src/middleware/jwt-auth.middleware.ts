import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { env } from '../shared/env';

@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload;
      (req as unknown as { user: jwt.JwtPayload })['user'] = payload ;
      next();
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
