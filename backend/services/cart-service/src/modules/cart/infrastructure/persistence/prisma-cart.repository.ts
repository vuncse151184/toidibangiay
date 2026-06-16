import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../shared/database/prisma.service';
import { CartItemView, CartView } from '../../domain/models/cart';
import {
  AddItemInput,
  CartRepositoryPort,
} from '../../domain/ports/cart.repository.port';

@Injectable()
export class PrismaCartRepository implements CartRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async getByUserId(userId: string): Promise<CartView | null> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { orderBy: { createdAt: 'asc' } } },
    });
    if (!cart) return null;
    return this.toView(cart);
  }

  async addOrUpdateItem(input: AddItemInput): Promise<CartView> {
    const cart = await this.prisma.cart.upsert({
      where: { userId: input.userId },
      create: { userId: input.userId },
      update: {},
    });

    await this.prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: cart.id, variantId: input.variantId } },
      create: {
        cartId: cart.id,
        productId: input.productId,
        variantId: input.variantId,
        productName: input.productName,
        variantLabel: input.variantLabel ?? null,
        imageUrl: input.imageUrl ?? null,
        unitPrice: new Prisma.Decimal(input.unitPrice),
        quantity: input.quantity,
      },
      update: {
        quantity: { increment: input.quantity },
        unitPrice: new Prisma.Decimal(input.unitPrice),
        productName: input.productName,
        variantLabel: input.variantLabel ?? null,
        imageUrl: input.imageUrl ?? null,
      },
    });

    return this.getByUserId(input.userId) as Promise<CartView>;
  }

  async updateItemQuantity(userId: string, variantId: string, quantity: number): Promise<CartView> {
    const cart = await this.prisma.cart.findUniqueOrThrow({ where: { userId } });
    await this.prisma.cartItem.update({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
      data: { quantity },
    });
    return this.getByUserId(userId) as Promise<CartView>;
  }

  async removeItem(userId: string, variantId: string): Promise<CartView> {
    const cart = await this.prisma.cart.findUniqueOrThrow({ where: { userId } });
    await this.prisma.cartItem.delete({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
    });
    return this.getByUserId(userId) as Promise<CartView>;
  }

  async mergeGuestCart(guestUserId: string, userId: string): Promise<CartView> {
    const guestCart = await this.prisma.cart.findUnique({
      where: { userId: guestUserId },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      const userCart = await this.getByUserId(userId);
      return userCart ?? { id: '', userId, items: [], totalItems: 0, grandTotal: '0.00' };
    }

    const userCart = await this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    for (const item of guestCart.items) {
      await this.prisma.cartItem.upsert({
        where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } },
        create: {
          cartId: userCart.id,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          variantLabel: item.variantLabel,
          imageUrl: item.imageUrl,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        },
        update: { quantity: { increment: item.quantity } },
      });
    }

    await this.prisma.cartItem.deleteMany({ where: { cartId: guestCart.id } });
    await this.prisma.cart.delete({ where: { id: guestCart.id } });

    return this.getByUserId(userId) as Promise<CartView>;
  }

  async clear(userId: string): Promise<void> {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
  }

  private toView(cart: {
    id: string;
    userId: string;
    items: {
      id: string;
      productId: string;
      variantId: string;
      productName: string;
      variantLabel: string | null;
      imageUrl: string | null;
      unitPrice: Prisma.Decimal;
      quantity: number;
    }[];
  }): CartView {
    const items: CartItemView[] = cart.items.map((item) => {
      const price = Number(item.unitPrice);
      const subtotal = (price * item.quantity).toFixed(2);
      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        variantLabel: item.variantLabel,
        imageUrl: item.imageUrl,
        unitPrice: price.toFixed(2),
        quantity: item.quantity,
        subtotal,
      };
    });

    const grandTotal = items
      .reduce((sum, i) => sum + parseFloat(i.subtotal), 0)
      .toFixed(2);

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
      grandTotal,
    };
  }
}
