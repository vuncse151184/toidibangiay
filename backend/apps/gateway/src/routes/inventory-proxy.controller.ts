import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { env } from '../shared/env';
import { ProxyService } from './proxy.service';

@Controller('inventory')
export class InventoryProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get('admin/all')
  getAll(@Req() req: Request, @Res() res: Response) {
    return this.proxy.forward(req, res, { baseUrl: env.INVENTORY_SERVICE_URL, path: '/inventory/admin/all' });
  }

  @Get(':variantId')
  getStock(@Req() req: Request, @Res() res: Response, @Param('variantId') variantId: string) {
    return this.proxy.forward(req, res, { baseUrl: env.INVENTORY_SERVICE_URL, path: `/inventory/${encodeURIComponent(variantId)}` });
  }

  @Post('restock')
  restock(@Req() req: Request, @Res() res: Response, @Body() body: unknown) {
    return this.proxy.forward(req, res, { baseUrl: env.INVENTORY_SERVICE_URL, path: '/inventory/restock', body });
  }
}
