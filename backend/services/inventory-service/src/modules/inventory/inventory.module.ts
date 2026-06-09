import { Module } from '@nestjs/common';
import { ReserveStockUseCase } from './application/use-cases/reserve-stock.use-case';
import { ReleaseStockUseCase } from './application/use-cases/release-stock.use-case';
import { ConfirmSoldUseCase } from './application/use-cases/confirm-sold.use-case';
import { RestockUseCase } from './application/use-cases/restock.use-case';
import { GetInventoryUseCase } from './application/use-cases/get-inventory.use-case';
import { InventoryController } from './infrastructure/controllers/inventory.controller';

@Module({
  controllers: [InventoryController],
  providers: [ReserveStockUseCase, ReleaseStockUseCase, ConfirmSoldUseCase, RestockUseCase, GetInventoryUseCase],
})
export class InventoryModule {}
