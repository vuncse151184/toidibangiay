import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { env } from '../shared/env';
import { ProxyService } from './proxy.service';

@Controller('auth')
export class AuthProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get('me')
  getMe(@Req() req: Request, @Res() res: Response) {
    return this.proxy.forward(req, res, {
      baseUrl: env.AUTH_SERVICE_URL,
      path: '/auth/me',
    });
  }

  @Post(':action')
  authAction(
    @Req() req: Request,
    @Res() res: Response,
    @Param('action') action: string,
    @Body() body: unknown,
  ) {
    return this.proxy.forward(req, res, {
      baseUrl: env.AUTH_SERVICE_URL,
      path: `/auth/${encodeURIComponent(action)}`,
      body,
    });
  }
}
