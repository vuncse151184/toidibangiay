import { All, Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { env } from '../shared/env';
import { ProxyService } from './proxy.service';

@Controller()
export class CatalogProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get('products/search')
  searchProducts(@Req() req: Request, @Res() res: Response) {
    return this.proxy.forward(req, res, {
      baseUrl: env.PRODUCT_SERVICE_URL,
      path: '/products/search',
    });
  }

  @All('products')
  products(@Req() req: Request, @Res() res: Response, @Body() body: unknown) {
    return this.proxy.forward(req, res, {
      baseUrl: env.PRODUCT_SERVICE_URL,
      path: '/products',
      body,
    });
  }

  @All('products/:slugOrId')
  product(
    @Req() req: Request,
    @Res() res: Response,
    @Param('slugOrId') slugOrId: string,
    @Body() body: unknown,
  ) {
    return this.proxy.forward(req, res, {
      baseUrl: env.PRODUCT_SERVICE_URL,
      path: `/products/${encodeURIComponent(slugOrId)}`,
      body,
    });
  }

  @Post('products/:slugOrId/images')
  addProductImage(
    @Req() req: Request,
    @Res() res: Response,
    @Param('slugOrId') slugOrId: string,
    @Body() body: unknown,
  ) {
    return this.proxy.forward(req, res, {
      baseUrl: env.PRODUCT_SERVICE_URL,
      path: `/products/${encodeURIComponent(slugOrId)}/images`,
      body,
    });
  }

  @Post('products/:slugOrId/variants')
  productVariants(
    @Req() req: Request,
    @Res() res: Response,
    @Param('slugOrId') slugOrId: string,
    @Body() body: unknown,
  ) {
    return this.proxy.forward(req, res, {
      baseUrl: env.PRODUCT_SERVICE_URL,
      path: `/products/${encodeURIComponent(slugOrId)}/variants`,
      body,
    });
  }

  @All('categories')
  categories(@Req() req: Request, @Res() res: Response, @Body() body: unknown) {
    return this.proxy.forward(req, res, {
      baseUrl: env.PRODUCT_SERVICE_URL,
      path: '/categories',
      body,
    });
  }

  @All('categories/:slugOrId')
  category(
    @Req() req: Request,
    @Res() res: Response,
    @Param('slugOrId') slugOrId: string,
    @Body() body: unknown,
  ) {
    return this.proxy.forward(req, res, {
      baseUrl: env.PRODUCT_SERVICE_URL,
      path: `/categories/${encodeURIComponent(slugOrId)}`,
      body,
    });
  }

  @All('variants')
  variants(@Req() req: Request, @Res() res: Response, @Body() body: unknown) {
    return this.proxy.forward(req, res, {
      baseUrl: env.PRODUCT_SERVICE_URL,
      path: '/variants',
      body,
    });
  }

  @All('variants/:slugOrId')
  variant(
    @Req() req: Request,
    @Res() res: Response,
    @Param('slugOrId') slugOrId: string,
    @Body() body: unknown,
  ) {
    return this.proxy.forward(req, res, {
      baseUrl: env.PRODUCT_SERVICE_URL,
      path: `/variants/${encodeURIComponent(slugOrId)}`,
      body,
    });
  }
}
