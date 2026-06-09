import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { env } from '../shared/env';
import { ProxyService } from './proxy.service';

@Controller('cart')
export class CartProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  getCart(@Req() req: Request, @Res() res: Response) {
    return this.proxy.forward(req, res, {
      baseUrl: env.CART_SERVICE_URL,
      path: '/cart',
    });
  }

  @Post('items')
  addItem(@Req() req: Request, @Res() res: Response, @Body() body: unknown) {
    return this.proxy.forward(req, res, {
      baseUrl: env.CART_SERVICE_URL,
      path: '/cart/items',
      body,
    });
  }

  @Patch('items/:variantId')
  updateItem(
    @Req() req: Request,
    @Res() res: Response,
    @Param('variantId') variantId: string,
    @Body() body: unknown,
  ) {
    return this.proxy.forward(req, res, {
      baseUrl: env.CART_SERVICE_URL,
      path: `/cart/items/${encodeURIComponent(variantId)}`,
      body,
    });
  }

  @Delete('items/:variantId')
  removeItem(@Req() req: Request, @Res() res: Response, @Param('variantId') variantId: string) {
    return this.proxy.forward(req, res, {
      baseUrl: env.CART_SERVICE_URL,
      path: `/cart/items/${encodeURIComponent(variantId)}`,
    });
  }

  @Delete()
  clearCart(@Req() req: Request, @Res() res: Response) {
    return this.proxy.forward(req, res, {
      baseUrl: env.CART_SERVICE_URL,
      path: '/cart',
    });
  }

  @Post('merge')
  mergeCart(@Req() req: Request, @Res() res: Response) {
    return this.proxy.forward(req, res, {
      baseUrl: env.CART_SERVICE_URL,
      path: '/cart/merge',
    });
  }
}
