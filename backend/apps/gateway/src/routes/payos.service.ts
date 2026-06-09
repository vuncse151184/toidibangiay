import { createHmac } from 'crypto';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';

import { env } from '../shared/env';

type PayosItem = {
  name: string;
  quantity: number;
  price: number;
};

type CreatePaymentLinkInput = {
  orderCode: number;
  amount: number;
  description: string;
  items: PayosItem[];
};

type PayosCreatePaymentResponse = {
  code: string;
  desc: string;
  data?: {
    checkoutUrl?: string;
    paymentLinkId?: string;
  };
};

@Injectable()
export class PayosService {
  async createPaymentLink(input: CreatePaymentLinkInput) {
    // Khi chưa cấu hình PayOS (dev / staging), trả về mock URL thay vì crash.
    if (!this.isConfigured()) {
      const params = new URLSearchParams({
        orderCode: String(input.orderCode),
        amount: String(input.amount),
        description: input.description,
        method: 'PAYOS',
      });
      return {
        checkoutUrl: `${env.FRONTEND_URL}/checkout/mock-payment?${params.toString()}`,
        paymentLinkId: `mock-${input.orderCode}`,
      };
    }

    const description = input.description.slice(0, 25);
    const payload = {
      orderCode: input.orderCode,
      amount: input.amount,
      description,
      items: input.items,
      returnUrl: env.PAYOS_RETURN_URL,
      cancelUrl: env.PAYOS_CANCEL_URL,
      signature: this.sign({
        amount: input.amount,
        cancelUrl: env.PAYOS_CANCEL_URL,
        description,
        orderCode: input.orderCode,
        returnUrl: env.PAYOS_RETURN_URL,
      }),
    };

    const response = await fetch(`${env.PAYOS_API_URL}/v2/payment-requests`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-client-id': env.PAYOS_CLIENT_ID as string,
        'x-api-key': env.PAYOS_API_KEY as string,
      },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as PayosCreatePaymentResponse;

    if (!response.ok || !result.data?.checkoutUrl) {
      throw new ServiceUnavailableException(
        result.desc || 'Failed to create PayOS payment link',
      );
    }

    return {
      checkoutUrl: result.data.checkoutUrl,
      paymentLinkId: result.data.paymentLinkId,
    };
  }

  private isConfigured(): boolean {
    return !!(env.PAYOS_CLIENT_ID && env.PAYOS_API_KEY && env.PAYOS_CHECKSUM_KEY);
  }

  private sign(data: Record<string, string | number>) {
    const raw = Object.keys(data)
      .sort()
      .map((key) => `${key}=${data[key]}`)
      .join('&');

    return createHmac('sha256', env.PAYOS_CHECKSUM_KEY as string)
      .update(raw)
      .digest('hex');
  }
}
