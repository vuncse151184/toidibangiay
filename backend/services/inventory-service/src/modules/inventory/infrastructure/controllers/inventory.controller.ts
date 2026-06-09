import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StockOperationDto, RestockDto } from '../../application/dto/stock-operation.dto';
import { ReserveStockUseCase } from '../../application/use-cases/reserve-stock.use-case';
import { ReleaseStockUseCase } from '../../application/use-cases/release-stock.use-case';
import { ConfirmSoldUseCase } from '../../application/use-cases/confirm-sold.use-case';
import { RestockUseCase } from '../../application/use-cases/restock.use-case';
import { GetInventoryUseCase } from '../../application/use-cases/get-inventory.use-case';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly reserveStock: ReserveStockUseCase,
    private readonly releaseStock: ReleaseStockUseCase,
    private readonly confirmSold: ConfirmSoldUseCase,
    private readonly restock: RestockUseCase,
    private readonly getInventory: GetInventoryUseCase,
  ) {}

  @Post('reserve')
  reserve(@Body() dto: StockOperationDto) { return this.reserveStock.execute(dto); }

  @Post('release')
  release(@Body() dto: StockOperationDto) { return this.releaseStock.execute(dto); }

  @Post('confirm-sold')
  confirmSoldHandler(@Body() dto: StockOperationDto) { return this.confirmSold.execute(dto); }

  @Post('restock')
  restockHandler(@Body() dto: RestockDto) { return this.restock.execute(dto); }

  @Get('admin/all')
  getAll(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.getInventory.getAll(+page, +limit);
  }

  @Get(':variantId')
  getOne(@Param('variantId') variantId: string) { return this.getInventory.execute(variantId); }
}
