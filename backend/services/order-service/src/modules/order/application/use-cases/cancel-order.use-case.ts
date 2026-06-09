import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { env } from '../../../../shared/config/env';

@Injectable()
export class CancelOrderUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(orderId: string, userId: string, isAdmin = false) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    if (!isAdmin && order.userId !== userId) throw new ForbiddenException('Không có quyền hủy đơn hàng này');
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new BadRequestException(`Không thể hủy đơn hàng ở trạng thái ${order.status}`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: orderId }, data: { status: 'CANCELLED' } });
      await tx.orderEvent.create({ data: { orderId, status: 'CANCELLED', note: 'Đơn hàng bị hủy', createdBy: userId } });
    });

    fetch(`${env.INVENTORY_SERVICE_URL}/api/inventory/release`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        orderId,
        items: order.items.map((i: any) => ({ variantId: i.variantId, quantity: i.quantity })),
      }),
    }).catch(() => null);

    this.sendCancelNotification(order.userId, order.orderCode, (order as any).total).catch(() => null);

    return { message: 'Đơn hàng đã được hủy thành công' };
  }

  private async sendCancelNotification(userId: string, orderCode: string, total: number) {
    const userRes = await fetch(`${env.USER_SERVICE_URL}/api/users/internal/${userId}`).catch(() => null);
    if (!userRes?.ok) return;
    const user = await userRes.json() as { email: string; name: string };
    if (!user?.email) return;

    await fetch(`${env.NOTIFICATION_SERVICE_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        userId,
        toEmail: user.email,
        type: 'ORDER_CANCELLED',
        payload: { orderCode, total, customerName: user.name },
      }),
    });
  }
}
