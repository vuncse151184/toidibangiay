import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { env } from '../../../../shared/config/env';

@Injectable()
export class MomoNotifyUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(body: Record<string, any>) {
    const {
      partnerCode, orderId, requestId, amount, orderInfo, orderType,
      transId, resultCode, message, payType, extraData, signature,
    } = body;

    const isSuccess = resultCode === 0;
    let isValid = false;

    if (env.MOMO_SECRET_KEY && env.MOMO_ACCESS_KEY) {
      const rawSig = `accessKey=${env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&resultCode=${resultCode}&transId=${transId}`;
      const expected = crypto.createHmac('sha256', env.MOMO_SECRET_KEY).update(rawSig).digest('hex');
      isValid = expected === signature;
    } else {
      // Dev mode: no credentials → treat as valid
      isValid = true;
    }

    await this.prisma.payment.updateMany({
      where: { orderId: String(orderId) },
      data: {
        status: (isValid && isSuccess) ? 'COMPLETED' : 'FAILED',
        gatewayRef: String(transId ?? ''),
        rawResponse: body as any,
        completedAt: new Date(),
      },
    });

    if (isValid && isSuccess) {
      fetch(`${env.ORDER_SERVICE_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json', authorization: 'Bearer internal' },
        body: JSON.stringify({ status: 'CONFIRMED', note: 'Đã thanh toán qua MoMo' }),
      }).catch(() => null);
    }

    return { success: isValid && isSuccess };
  }
}
