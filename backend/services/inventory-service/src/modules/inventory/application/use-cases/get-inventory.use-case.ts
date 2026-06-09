import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service';

@Injectable()
export class GetInventoryUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(variantId: string) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { variantId } });
    if (!item) throw new NotFoundException(`Không tìm thấy tồn kho cho variant ${variantId}`);
    return { data: { ...item, available: item.quantity - item.reserved } };
  }

  async getAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const items = await this.prisma.inventoryItem.findMany({
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });
    return { data: items.map(i => ({ ...i, available: i.quantity - i.reserved })) };
  }
}
