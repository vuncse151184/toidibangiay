import { Body, Controller, Get, Param, Post, Put, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { env } from '../shared/env';
import { ProxyService } from './proxy.service';

@Controller('orders')
export class OrderProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Post()
  createOrder(@Req() req: Request, @Res() res: Response, @Body() body: unknown) {
    return this.proxy.forward(req, res, { baseUrl: env.ORDER_SERVICE_URL, path: '/orders', body });
  }

  @Get()
  getOrders(@Req() req: Request, @Res() res: Response) {
    return this.proxy.forward(req, res, { baseUrl: env.ORDER_SERVICE_URL, path: '/orders' });
  }

  @Get('admin/all')
  getAllOrders(@Req() req: Request, @Res() res: Response) {
    return this.proxy.forward(req, res, { baseUrl: env.ORDER_SERVICE_URL, path: '/orders/admin/all' });
  }

  @Get(':id')
  getOrder(@Req() req: Request, @Res() res: Response, @Param('id') id: string) {
    return this.proxy.forward(req, res, { baseUrl: env.ORDER_SERVICE_URL, path: `/orders/${id}` });
  }

  @Put(':id/cancel')
  cancelOrder(@Req() req: Request, @Res() res: Response, @Param('id') id: string) {
    return this.proxy.forward(req, res, { baseUrl: env.ORDER_SERVICE_URL, path: `/orders/${id}/cancel` });
  }

  @Put(':id/status')
  updateStatus(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Body() body: unknown) {
    return this.proxy.forward(req, res, { baseUrl: env.ORDER_SERVICE_URL, path: `/orders/${id}/status`, body });
  }
}
