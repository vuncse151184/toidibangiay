import { All, Body, Controller, Get, Param, Put, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { env } from '../shared/env';
import { ProxyService } from './proxy.service';

@Controller()
export class BannersProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get('banners/hero')
  getHero(@Req() req: Request, @Res() res: Response) {
    return this.proxy.forward(req, res, {
      baseUrl: env.PRODUCT_SERVICE_URL,
      path: '/banners/hero',
    });
  }

  @Get('banners/hero/:key')
  getHeroByKey(@Req() req: Request, @Res() res: Response, @Param('key') key: string) {
    return this.proxy.forward(req, res, {
      baseUrl: env.PRODUCT_SERVICE_URL,
      path: `/banners/hero/${key}`,
    });
  }

  @Put('banners/hero/:key')
  upsertHero(
    @Req() req: Request,
    @Res() res: Response,
    @Param('key') key: string,
    @Body() body: unknown,
  ) {
    return this.proxy.forward(req, res, {
      baseUrl: env.PRODUCT_SERVICE_URL,
      path: `/banners/hero/${key}`,
      body,
    });
  }
}
