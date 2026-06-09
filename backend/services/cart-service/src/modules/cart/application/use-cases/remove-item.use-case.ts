import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CartView } from '../../domain/models/cart';
import { CART_REPOSITORY, CartRepositoryPort } from '../../domain/ports/cart.repository.port';

@Injectable()
export class RemoveItemUseCase {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: CartRepositoryPort,
  ) {}

  async execute(userId: string, variantId: string): Promise<CartView> {
    const cart = await this.cartRepository.getByUserId(userId);
    if (!cart || !cart.items.some((i) => i.variantId === variantId)) {
      throw new NotFoundException('Item not found in cart');
    }
    return this.cartRepository.removeItem(userId, variantId);
  }
}
