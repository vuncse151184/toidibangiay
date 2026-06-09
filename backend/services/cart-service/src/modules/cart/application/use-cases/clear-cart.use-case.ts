import { Inject, Injectable } from '@nestjs/common';

import { CART_REPOSITORY, CartRepositoryPort } from '../../domain/ports/cart.repository.port';

@Injectable()
export class ClearCartUseCase {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: CartRepositoryPort,
  ) {}

  async execute(userId: string): Promise<{ message: string }> {
    await this.cartRepository.clear(userId);
    return { message: 'Cart cleared' };
  }
}
