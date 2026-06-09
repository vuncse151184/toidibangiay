import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { RestockDto } from '../dto/stock-operation.dto';

@Injectable()
export class RestockUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: RestockDto) {
    await this.prisma.$transaction(async (tx) => {
      await tx.inventoryItem.upsert({
        where: { variantId: dto.variantId },
        update: { quantity: { increment: dto.quantity } },
        create: { variantId: dto.variantId, quantity: dto.quantity },
      });
      await tx.inventoryTransaction.create({
        data: { variantId: dto.variantId, type: 'RESTOCK', quantity: dto.quantity, note: dto.note },
      });
    });
    return { success: true, message: `Nhập ${dto.quantity} sản phẩm thành công` };
  }
}
