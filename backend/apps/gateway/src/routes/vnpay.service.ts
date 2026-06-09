import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';

import { env } from '../shared/env';

type CreateVnpayLinkInput = {
  orderId: string;
  amount: number;
  ipAddr?: string;
};

@Injectable()
export class VnpayService {
  createPaymentUrl(input: CreateVnpayLinkInput): string {
    // Dev fallback khi chưa cấu hình VNPAY
    if (!env.VNPAY_TMN_CODE || !env.VNPAY_HASH_SECRET) {
      const params = new URLSearchParams({
        orderId: input.orderId,
        amount: String(input.amount),
        method: 'VNPAY',
      });
      return `${env.FRONTEND_URL}/checkout/mock-payment?${params.toString()}`;
    }

    process.env.TZ = 'Asia/Ho_Chi_Minh';
    const createDate = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, 14);

    // vnp_TxnRef: phải là duy nhất, tối đa 100 ký tự
    const txnRef = `${input.orderId.slice(0, 8)}-${createDate}`;

    const rawParams: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: env.VNPAY_TMN_CODE,
      vnp_Amount: String(input.amount * 100), // VNPAY nhân 100
      vnp_CurrCode: 'VND',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan don hang ${input.orderId}`,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: `${env.FRONTEND_URL}/checkout/return`,
      vnp_IpAddr: input.ipAddr ?? '127.0.0.1',
      vnp_CreateDate: createDate,
    };

    // Theo mẫu VNPAY: sort keys, encode cả key lẫn value (space → +)
    const signData = VnpayService.buildSignData(rawParams);
    const signature = crypto
      .createHmac('sha512', env.VNPAY_HASH_SECRET)
      .update(signData, 'utf-8')
      .digest('hex');

    // Xây URL với cùng encoding đã dùng để ký
    const sortedKeys = Object.keys(rawParams).sort();
    const queryParts = sortedKeys.map(
      (k) =>
        `${encodeURIComponent(k)}=${encodeURIComponent(rawParams[k]).replace(/%20/g, '+')}`,
    );
    queryParts.push(`vnp_SecureHash=${signature}`);

    return `${env.VNPAY_URL}?${queryParts.join('&')}`;
  }

  /**
   * Chuẩn hóa params để tính chữ ký — theo đúng sortObject() của mẫu VNPAY:
   * sort keys (URL-encoded), encode values (space → +).
   */
  static buildSignData(params: Record<string, string>): string {
    return Object.keys(params)
      .sort()
      .map(
        (k) =>
          `${encodeURIComponent(k)}=${encodeURIComponent(params[k]).replace(/%20/g, '+')}`,
      )
      .join('&');
  }
}
