import { Inject, Injectable } from '@nestjs/common';

import { CartView } from '../../domain/models/cart';
import { CART_REPOSITORY, CartRepositoryPort } from '../../domain/ports/cart.repository.port';

@Injectable()
export class GetCartUseCase {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: CartRepositoryPort,
  ) {}

  async execute(userId: string): Promise<CartView> {
    const cart = await this.cartRepository.getByUserId(userId);
    if (!cart) {
      return { id: '', userId, items: [], totalItems: 0, grandTotal: '0.00' };
    }
    return cart;
  }
}
