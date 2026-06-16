import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { env } from '../../../../shared/config/env';
import { CreateOrderDto } from '../dto/create-order.dto';

@Injectable()
export class CreateOrderUseCase {
  constructor(private readonly prisma: PrismaService) {}
 
  async execute(userId: string, dto: CreateOrderDto, authorization: string) {
    // Forward JWT token — Cart Service dùng OptionalJwtAuthGuard, cần Authorization header
    const cartResponse = await fetch(`${env.CART_SERVICE_URL}/api/cart`, {
      headers: { authorization },
    }).catch(() => null);

    let cartItems: any[] = [];
    if (cartResponse?.ok) {
      const cartData = await cartResponse.json() as any; 
      cartItems = cartData?.data?.items ?? cartData?.items ?? [];
    } 
    if (!cartItems.length) throw new BadRequestException('Giỏ hàng trống');

    const orderCode = await this.generateOrderCode();
    const subtotal = cartItems.reduce(
      (sum: number, item: any) => sum + Number(item.unitPrice ?? item.price ?? 0) * (item.quantity ?? 1), 0,
    );
    const shippingFee = 30000;
    const total = subtotal + shippingFee;

    const shippingAddress = dto.shippingAddress ?? {
      fullName: 'Khách hàng',
      phone: '0000000000',
      street: 'Địa chỉ chưa cập nhật',
      ward: '',
      district: '',
      city: 'TP. Hồ Chí Minh',
    };

    const order = await this.prisma.$transaction(async (tx) => {
      return tx.order.create({
        data: {
          orderCode,
          userId,
          status: 'PENDING',
          subtotal,
          shippingFee,
          total,
          paymentMethod: dto.paymentMethod as any,
          shippingAddress: shippingAddress as any,
          note: dto.note,
          items: {
            create: cartItems.map((item: any) => ({
              variantId: item.variantId,
              productName: item.productName ?? 'Sản phẩm',
              variantTitle: item.variantLabel ?? item.variantTitle ?? '',
              price: Number(item.unitPrice ?? item.price ?? 0),
              quantity: item.quantity ?? 1,
              imageUrl: item.imageUrl ?? null,
            })),
          },
          events: {
            create: { status: 'PENDING', note: 'Đơn hàng được tạo', createdBy: userId },
          },
        },
        include: { items: true, events: true },
      });
    });

    // Chỉ xóa giỏ hàng ngay với COD — VNPAY/MOMO chờ payment confirmed rồi frontend mới clear
    if (dto.paymentMethod === 'COD') {
      fetch(`${env.CART_SERVICE_URL}/api/cart`, {
        method: 'DELETE',
        headers: { authorization },
      }).catch(() => null);
    }

    // Reserve inventory (best effort)
    fetch(`${env.INVENTORY_SERVICE_URL}/api/inventory/reserve`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        orderId: order.id,
        items: order.items.map((i: any) => ({ variantId: i.variantId, quantity: i.quantity })),
      }),
    }).catch(() => null);

    // Create payment link
    let paymentUrl: string | null = null;
    if (dto.paymentMethod !== 'COD') {
      try {
        const payRes = await fetch(`${env.PAYMENT_SERVICE_URL}/api/payments/create`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ orderId: order.id, amount: total, method: dto.paymentMethod }),
        });
        const payData = await payRes.json() as any;
        paymentUrl = payData?.data?.paymentUrl ?? null;
      } catch { /* non-blocking */ }
    }

    return {
      data: {
        orderId: order.id,
        orderCode: order.orderCode,
        status: order.status,
        items: order.items,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        total: order.total,
        paymentUrl,
      },
    };
  }

  private async generateOrderCode(): Promise<string> {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const count = await this.prisma.order.count({ where: { createdAt: { gte: startOfDay } } });
    return `TDB-${today}-${String(count + 1).padStart(4, '0')}`;
  }
}
