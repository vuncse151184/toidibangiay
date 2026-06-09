import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../../../shared/database/prisma.service';
import { StockOperationDto } from '../dto/stock-operation.dto';

/**
 * Release Stock — hoàn trả reserved khi đơn bị huỷ.
 *
 * Bug cũ: findUnique() ở NGOÀI transaction → đọc giá trị cũ (stale read) →
 *   Math.min(qty, stale_reserved) sai khi có concurrent writes.
 *
 * Fix: advisory lock + đọc bên trong transaction → dữ liệu luôn chính xác.
 */
@Injectable()
export class ReleaseStockUseCase {
  private readonly logger = new Logger(ReleaseStockUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: StockOperationDto): Promise<{ success: boolean }> {
    for (const item of dto.items) {
      await this.releaseWithLock({
        orderId: dto.orderId,
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }
    return { success: true };
  }

  private async releaseWithLock(params: {
    orderId: string;
    variantId: string;
    quantity: number;
  }): Promise<void> {
    const { orderId, variantId, quantity } = params;

    await this.prisma.$transaction(async (tx) => {
      // Lock serialize concurrent release/reserve trên cùng variantId
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${variantId})::bigint)
      `;

      // Đọc bên trong transaction → luôn là giá trị mới nhất
      const inv = await tx.inventoryItem.findUnique({ where: { variantId } });
      if (!inv) {
        this.logger.warn(
          `[Release] variantId=${variantId} không tìm thấy, bỏ qua`,
        );
        return;
      }

      // Chỉ release tối đa lượng đang reserved — không để reserved < 0
      const toRelease = Math.min(quantity, inv.reserved);

      this.logger.log(
        `[Release] orderId=${orderId} variantId=${variantId} ` +
          `release=${toRelease} (reserved_before=${inv.reserved})`,
      );

      await tx.inventoryItem.update({
        where: { variantId },
        data: { reserved: { decrement: toRelease } },
      });

      await tx.inventoryTransaction.create({
        data: {
          variantId,
          type: 'RELEASE',
          quantity: toRelease,
          referenceId: orderId,
          note: `released=${toRelease} reserved_before=${inv.reserved}`,
        },
      });
    });
  }
}
