import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVariantDto } from './dto/create-variant.dto';

@Injectable()
export class VariantsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByProduct(productId: string) {
    return this.prisma.productVariant.findMany({
      where: { productId, isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  async create(productId: string, dto: CreateVariantDto) {
    return this.prisma.productVariant.create({
      data: { ...dto, productId },
    });
  }

  async findById(variantId: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: { include: { images: { orderBy: { position: 'asc' } } } } },
    });
    if (!variant) throw new NotFoundException(`Variant not found`);
    return variant;
  }

  async updateStock(variantId: string, delta: number) {
    const variant = await this.prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) throw new NotFoundException(`Variant "${variantId}" not found`);

    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: { increment: delta } },
    });
  }
}
