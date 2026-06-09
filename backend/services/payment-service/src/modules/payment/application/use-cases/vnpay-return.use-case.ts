import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { env } from '../../../../shared/config/env';

@Injectable()
export class VNPayReturnUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: Record<string, string>) {
    // console.log('VNPay return query:', query);
    const secureHash = query.vnp_SecureHash;
    const filteredQuery: Record<string, string> = {};
    for (const [k, v] of Object.entries(query)) {
      if (k !== 'vnp_SecureHash' && k !== 'vnp_SecureHashType') filteredQuery[k] = v;
    }
    const sortedKeys = Object.keys(filteredQuery).sort();
    // Encode values theo đúng chuẩn VNPAY (space → +), khớp với cách ký khi tạo URL
    const signData = sortedKeys
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(filteredQuery[k]).replace(/%20/g, '+')}`)
      .join('&');
    const checkHash = env.VNPAY_HASH_SECRET
      ? crypto.createHmac('sha512', env.VNPAY_HASH_SECRET).update(signData).digest('hex')
      : secureHash;
    const isValid = checkHash === secureHash;
    const isSuccess = query.vnp_ResponseCode === '00';

    // console.log(`VNPay return validation: isValid=${isValid}, isSuccess=${isSuccess}, tnxRef=${query.vnp_TxnRef}`);
    await this.prisma.payment.updateMany({
      where: { idempotencyKey: { contains: query.vnp_TxnRef?.split('-')[0] ?? '' } },
      data: {
        status: (isValid && isSuccess) ? 'COMPLETED' : 'FAILED',
        gatewayRef: query.vnp_TransactionNo,
        rawResponse: query as any,
        completedAt: new Date(),
      },
    });

    if (isValid && isSuccess) {
      const payment = await this.prisma.payment.findFirst({
        where: { idempotencyKey: { contains: query.vnp_TxnRef?.split('-')[0] ?? '' } },
      });
      if (payment) {
        fetch(`${env.ORDER_SERVICE_URL}/api/orders/${payment.orderId}/status`, {
          method: 'PUT',
          headers: { 'content-type': 'application/json', 'authorization': 'Bearer internal' },
          body: JSON.stringify({ status: 'CONFIRMED', note: 'Đã thanh toán qua VNPay' }),
        }).catch(() => null);
      }
    }

    return { success: isValid && isSuccess, message: isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại' };
  }
}
