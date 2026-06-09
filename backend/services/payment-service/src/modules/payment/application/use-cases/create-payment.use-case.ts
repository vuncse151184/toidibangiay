import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { env } from '../../../../shared/config/env';
import { CreatePaymentDto } from '../dto/create-payment.dto';

@Injectable()
export class CreatePaymentUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreatePaymentDto) {
    const idempotencyKey = `${dto.orderId}-create`;
    const existing = await this.prisma.payment.findUnique({ where: { idempotencyKey } });
    if (existing) {
      return { data: { paymentUrl: null, status: existing.status } };
    }

    if (dto.method === 'COD') {
      await this.prisma.payment.create({
        data: { orderId: dto.orderId, idempotencyKey, method: 'COD', amount: dto.amount },
      });
      return { data: { paymentUrl: null } };
    }

    let paymentUrl: string;
    if (dto.method === 'VNPAY') {
      paymentUrl = this.createVNPayUrl(dto.orderId, dto.amount);
    } else {
      paymentUrl = await this.createMoMoPaymentUrl(dto.orderId, dto.amount);
    }

    await this.prisma.payment.create({
      data: { orderId: dto.orderId, idempotencyKey, method: dto.method as any, amount: dto.amount },
    });

    return { data: { paymentUrl } };
  }

  private createVNPayUrl(orderId: string, amount: number): string {
    if (!env.VNPAY_TMN_CODE || !env.VNPAY_HASH_SECRET) {
      return `${env.FRONTEND_URL}/checkout/mock-payment?orderId=${orderId}&amount=${amount}&method=VNPAY`;
    }
    const createDate = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const shortId = orderId.replace(/-/g, '').slice(0, 8);
    const txnRef = `${shortId}-${createDate}`;
    const params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: env.VNPAY_TMN_CODE,
      vnp_Amount: String(amount * 100),
      vnp_CurrCode: 'VND',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
      vnp_OrderType: 'billpayment',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: `${env.FRONTEND_URL}/checkout/return`,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
    };
    const sortedKeys = Object.keys(params).sort();
    // Encode values theo đúng chuẩn VNPAY (space → +)
    const signData = sortedKeys
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k]).replace(/%20/g, '+')}`)
      .join('&');
    const signature = crypto.createHmac('sha512', env.VNPAY_HASH_SECRET!).update(signData, 'utf-8').digest('hex');
    // Build URL với cùng encoding
    const queryParts = sortedKeys.map(
      k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k]).replace(/%20/g, '+')}`
    );
    queryParts.push(`vnp_SecureHash=${signature}`);
    console.log('VNPAY URL:', `${env.VNPAY_URL}?${queryParts.join('&')}`);
    return `${env.VNPAY_URL}?${queryParts.join('&')}`;
  }

  private async createMoMoPaymentUrl(orderId: string, amount: number): Promise<string> {
    if (!env.MOMO_PARTNER_CODE || !env.MOMO_ACCESS_KEY || !env.MOMO_SECRET_KEY) {
      return `${env.FRONTEND_URL}/checkout/mock-payment?orderId=${orderId}&amount=${amount}&method=MOMO`;
    }
    const ts = new Date().getTime();
    const requestId = `${orderId}-${ts}`;
    const orderInfo = `Thanh toan don hang ${orderId}`;
    const redirectUrl = `${env.FRONTEND_URL}/checkout/result`;
    const ipnUrl = `${env.API_BASE_URL}/api/payments/momo/notify`;
    const rawSig = `accessKey=${env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${env.MOMO_PARTNER_CODE}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=payWithMethod`;
    const signature = crypto.createHmac('sha256', env.MOMO_SECRET_KEY!).update(rawSig).digest('hex');
    const response = await fetch(env.MOMO_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partnerCode: env.MOMO_PARTNER_CODE,
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        requestType: 'payWithMethod',
        extraData: '',
        lang: 'vi',
        signature,
      }),
    });
    const data = await response.json() as any;
    if (data.resultCode !== 0) throw new Error(`MoMo error: ${data.message}`);
    return data.payUrl;
  }
}
