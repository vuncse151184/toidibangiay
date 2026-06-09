import { BadRequestException, Controller, Headers, Post } from '@nestjs/common';

import { env } from '../shared/env';
import { ProxyService } from './proxy.service';

type CreateOrderResult = {
  data: {
    orderId: string;
    orderCode: string;
    paymentUrl: string | null;
  };
};

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly proxy: ProxyService) {}

  @Post()
  async createCheckout(
    @Headers('authorization') authorization?: string,
    @Headers('cookie') cookie?: string,
  ) {
    // Delegate sang Order Service — tự tạo Order record, gọi Payment Service
    // để tạo Payment record và trả về VNPAY URL.
    const result = await this.proxy.request<CreateOrderResult>({
      baseUrl: env.ORDER_SERVICE_URL,
      path: '/orders',
      method: 'POST',
      body: { paymentMethod: 'VNPAY' },
      authorization,
      cookie,
    });

    const { orderId, orderCode, paymentUrl } = result.data;

    if (!paymentUrl) {
      throw new BadRequestException('Không thể tạo link thanh toán');
    }

    return { orderId, orderCode, checkoutUrl: paymentUrl };
  }
}
