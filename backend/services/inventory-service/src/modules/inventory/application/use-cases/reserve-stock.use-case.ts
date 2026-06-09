import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../../../shared/database/prisma.service';
import { StockOperationDto } from '../dto/stock-operation.dto';

/**
 * FIFO Reserve Stock — chống oversell khi nhiều đơn đặt cùng lúc.
 *
 * Vấn đề (race condition):
 *   T1: read available=1 → pass check → (chưa kịp update)
 *   T2: read available=1 → pass check → update reserved+=1
 *   T1: update reserved+=1  ← reserved vượt quantity → OVERSELL!
 *
 * Giải pháp — pg_advisory_xact_lock:
 *   • PostgreSQL xếp hàng các transaction xin cùng lock key theo thứ tự ĐẾN (FIFO).
 *   • Chỉ 1 transaction giữ lock tại một thời điểm → đọc + ghi là atomic.
 *   • Ai đến trước → được kiểm tra tồn kho trước → hết hàng thì đơn sau nhận lỗi.
 *   • Lock tự giải phóng khi transaction commit hoặc rollback.
 */
@Injectable()
export class ReserveStockUseCase {
  private readonly logger = new Logger(ReserveStockUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: StockOperationDto): Promise<{ success: boolean }> {
    const queuedAt = new Date();

    // Xử lý tuần tự từng item để tránh deadlock khi 2 đơn đặt
    // cùng bộ sản phẩm nhưng theo thứ tự ngược nhau.
    for (const item of dto.items) {
      await this.reserveWithFifo({
        orderId: dto.orderId,
        variantId: item.variantId,
        quantity: item.quantity,
        queuedAt,
      });
    }

    return { success: true };
  }

  private async reserveWithFifo(params: {
    orderId: string;
    variantId: string;
    quantity: number;
    queuedAt: Date;
  }): Promise<void> {
    const { orderId, variantId, quantity, queuedAt } = params;

    await this.prisma.$transaction(async (tx) => {
      // ── BƯỚC 1: Lấy FIFO lock theo variantId ──────────────────────────────
      //
      //   hashtext(variantId) → int4  →  cast bigint  →  lock key
      //
      //   Đặc tính FIFO của PostgreSQL lock queue:
      //     Đơn A (10:00:00.001) → xin lock → được lock → kiểm tra tồn kho
      //     Đơn B (10:00:00.002) → xin lock → ĐỢI (xếp sau A trong queue)
      //     Đơn A commit          → B được lock → thấy available đã giảm
      //
      //   Nếu 2 variantId khác nhau → 2 lock key khác nhau → chạy song song,
      //   không block nhau → throughput cao.
      // ──────────────────────────────────────────────────────────────────────
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${variantId})::bigint)
      `;

      // ── BƯỚC 2: Đọc tồn kho SAU KHI có lock ──────────────────────────────
      // Lúc này không có transaction nào khác đang ghi vào variantId này,
      // nên giá trị đọc được là chính xác và mới nhất.
      // ──────────────────────────────────────────────────────────────────────
      let inv = await tx.inventoryItem.findUnique({ where: { variantId } });
      if (!inv) {
        inv = await tx.inventoryItem.create({
          data: { variantId, quantity: 0, reserved: 0 },
        });
      }

      const available = inv.quantity - inv.reserved;

      this.logger.log(
        `[FIFO] reserve | orderId=${orderId} variantId=${variantId} ` +
          `qty=${quantity} available=${available} ` +
          `queue#=${queuedAt.getTime()}`,
      );

      // ── BƯỚC 3: Kiểm tra tồn kho — FIFO đảm bảo thứ tự công bằng ─────────
      if (available < quantity) {
        this.logger.warn(
          `[FIFO] REJECTED | orderId=${orderId} variantId=${variantId} ` +
            `need=${quantity} available=${available}`,
        );
        throw new BadRequestException(
          `Sản phẩm không đủ số lượng. ` +
            `Hiện còn ${available}, bạn yêu cầu ${quantity}. ` +
            `Vui lòng giảm số lượng hoặc chọn sản phẩm khác.`,
        );
      }

      // ── BƯỚC 4: Tăng reserved — an toàn vì chúng ta đang giữ exclusive lock
      await tx.inventoryItem.update({
        where: { variantId },
        data: { reserved: { increment: quantity } },
      });

      const remainingAvailable = available - quantity;
      if (remainingAvailable < 5) {
        this.logger.warn(
          `[LowStock] variantId=${variantId} còn ${remainingAvailable} sản phẩm khả dụng sau khi đặt hàng`,
        );
      }

      // ── BƯỚC 5: Ghi transaction log với FIFO timestamp để audit ───────────
      await tx.inventoryTransaction.create({
        data: {
          variantId,
          type: 'RESERVE',
          quantity: -quantity,
          referenceId: orderId,
          note: `FIFO#${queuedAt.getTime()} req=${quantity} avail_before=${available}`,
        },
      });
    });
  }
}
