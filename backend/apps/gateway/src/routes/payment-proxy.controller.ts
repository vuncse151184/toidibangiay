import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { env } from '../shared/env';
import { ProxyService } from './proxy.service';

@Controller('payments')
export class PaymentProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Post('create')
  createPayment(@Req() req: Request, @Res() res: Response, @Body() body: unknown) {
    return this.proxy.forward(req, res, { baseUrl: env.PAYMENT_SERVICE_URL, path: '/payments/create', body });
  }

  @Get('vnpay/return')
  vnpayReturn(@Req() req: Request, @Res() res: Response) {
    return this.proxy.forward(req, res, { baseUrl: env.PAYMENT_SERVICE_URL, path: '/payments/vnpay/return' });
  }

  @Post('momo/notify')
  momoNotify(@Req() req: Request, @Res() res: Response, @Body() body: unknown) {
    return this.proxy.forward(req, res, { baseUrl: env.PAYMENT_SERVICE_URL, path: '/payments/momo/notify', body });
  }
}
