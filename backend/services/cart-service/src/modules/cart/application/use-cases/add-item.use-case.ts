import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ProductClientService } from '../../../../shared/product-client/product-client.service';
import { CartView } from '../../domain/models/cart';
import { CART_REPOSITORY, CartRepositoryPort } from '../../domain/ports/cart.repository.port';
import { AddItemDto } from '../dto/add-item.dto';

@Injectable()
export class AddItemUseCase {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: CartRepositoryPort,
    private readonly productClient: ProductClientService,
  ) {}

  async execute(userId: string, dto: AddItemDto): Promise<CartView> {
    const variant = await this.productClient.getVariantById(dto.variantId);
    if (!variant) throw new BadRequestException('Variant not found');
    if (variant.stock < dto.quantity) throw new BadRequestException('Insufficient stock');

    const variantLabel = [variant.color, variant.size].filter(Boolean).join(' / ') || null;
    const imageUrl = variant.product.images[0]?.url ?? null;

    return this.cartRepository.addOrUpdateItem({
      userId,
      variantId: dto.variantId,
      productId: variant.product.id,
      productName: variant.product.name,
      variantLabel,
      imageUrl,
      unitPrice: String(variant.price),
      quantity: dto.quantity,
    });
  }
}
