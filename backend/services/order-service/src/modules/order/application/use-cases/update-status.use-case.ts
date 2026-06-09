import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { env } from '../../../../shared/config/env';

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

@Injectable()
export class UpdateStatusUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(orderId: string, dto: UpdateStatusDto, updatedBy: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    const allowed = VALID_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(`Không thể chuyển từ ${order.status} sang ${dto.status}`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: orderId }, data: { status: dto.status as any } });
      await tx.orderEvent.create({ data: { orderId, status: dto.status as any, note: dto.note, createdBy: updatedBy } });
    });

    if (dto.status === 'CONFIRMED') {
      fetch(`${env.INVENTORY_SERVICE_URL}/api/inventory/confirm-sold`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          orderId,
          items: order.items.map((i: any) => ({ variantId: i.variantId, quantity: i.quantity })),
        }),
      }).catch(() => null);
    }

    const NOTIFIABLE = ['CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (NOTIFIABLE.includes(dto.status)) {
      this.sendNotification(order.userId, order.orderCode, dto.status, (order as any).total).catch(() => null);
    }

    return { message: 'Trạng thái đơn hàng đã được cập nhật' };
  }

  private async sendNotification(userId: string, orderCode: string, status: string, total: number) {
    const userRes = await fetch(`${env.USER_SERVICE_URL}/api/users/internal/${userId}`).catch(() => null);
    if (!userRes?.ok) return;
    const user = await userRes.json() as { email: string; name: string };
    if (!user?.email) return;

    const TYPE_MAP: Record<string, string> = {
      CONFIRMED: 'ORDER_CONFIRMED',
      SHIPPED: 'ORDER_SHIPPED',
      DELIVERED: 'ORDER_DELIVERED',
      CANCELLED: 'ORDER_CANCELLED',
    };

    await fetch(`${env.NOTIFICATION_SERVICE_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        userId,
        toEmail: user.email,
        type: TYPE_MAP[status],
        payload: { orderCode, total, customerName: user.name },
      }),
    });
  }
}
