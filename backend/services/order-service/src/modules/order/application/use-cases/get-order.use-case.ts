import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service';

@Injectable()
export class GetOrderUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(orderId: string, userId: string, isAdmin = false) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, events: { orderBy: { createdAt: 'asc' } } },
    });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    if (!isAdmin && order.userId !== userId) throw new ForbiddenException('Không có quyền xem đơn hàng này');
    return { data: order };
  }
}
