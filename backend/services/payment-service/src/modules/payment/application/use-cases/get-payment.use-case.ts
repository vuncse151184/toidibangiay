import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service';

@Injectable()
export class GetPaymentUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(orderId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) throw new NotFoundException('Không tìm thấy thông tin thanh toán');
    return { data: payment };
  }
}
