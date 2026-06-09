import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CART_REPOSITORY, CartRepositoryPort } from '../../domain/ports/cart.repository.port';
import { CartView } from '../../domain/models/cart';

@Injectable()
export class MergeCartUseCase {
  constructor(
    @Inject(CART_REPOSITORY) private readonly cartRepository: CartRepositoryPort,
  ) {}

  async execute(userId: string, sessionId: string): Promise<CartView> {
    if (!sessionId) throw new BadRequestException('sessionId is required');
    const guestUserId = `guest_${sessionId}`;
    return this.cartRepository.mergeGuestCart(guestUserId, userId);
  }
}
