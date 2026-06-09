import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../../../shared/database/prisma.service';
import { StockOperationDto } from '../dto/stock-operation.dto';

/**
 * Confirm Sold — trừ quantity + reserved khi thanh toán thành công.
 *
 * Bug cũ: findUnique() ở NGOÀI transaction → stale read →
 *   Math.min dùng giá trị cũ trong khi quantity/reserved đã thay đổi.
 *
 * Fix: advisory lock + đọc bên trong transaction.
 */
@Injectable()
export class ConfirmSoldUseCase {
  private readonly logger = new Logger(ConfirmSoldUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: StockOperationDto): Promise<{ success: boolean }> {
    for (const item of dto.items) {
      await this.confirmWithLock({
        orderId: dto.orderId,
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }
    return { success: true };
  }

  private async confirmWithLock(params: {
    orderId: string;
    variantId: string;
    quantity: number;
  }): Promise<void> {
    const { orderId, variantId, quantity } = params;

    await this.prisma.$transaction(async (tx) => {
      // Lock serialize concurrent confirm/reserve/release trên cùng variantId
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${variantId})::bigint)
      `;

      // Đọc bên trong transaction → luôn là giá trị mới nhất
      const inv = await tx.inventoryItem.findUnique({ where: { variantId } });
      if (!inv) {
        this.logger.warn(
          `[ConfirmSold] variantId=${variantId} không tìm thấy, bỏ qua`,
        );
        return;
      }

      // Giới hạn trừ theo số thực có — tránh quantity/reserved xuống âm
      const qtyToDeduct = Math.min(quantity, inv.quantity);
      const resToDeduct = Math.min(quantity, inv.reserved);

      this.logger.log(
        `[ConfirmSold] orderId=${orderId} variantId=${variantId} ` +
          `sold=${qtyToDeduct} (qty_before=${inv.quantity} res_before=${inv.reserved})`,
      );

      await tx.inventoryItem.update({
        where: { variantId },
        data: {
          quantity: { decrement: qtyToDeduct },
          reserved: { decrement: resToDeduct },
        },
      });

      const newQuantity = inv.quantity - qtyToDeduct;
      if (newQuantity < 5) {
        this.logger.warn(
          `[LowStock] variantId=${variantId} còn ${newQuantity} sản phẩm sau khi bán`,
        );
      }

      await tx.inventoryTransaction.create({
        data: {
          variantId,
          type: 'SOLD',
          quantity: -qtyToDeduct,
          referenceId: orderId,
          note: `sold=${qtyToDeduct} qty_before=${inv.quantity} res_before=${inv.reserved}`,
        },
      });
    });
  }
}
