import { Body, Controller, Get, Headers, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { JwtAuthGuard, AuthenticatedUser } from '../../../../shared/guards/jwt-auth.guard';
import { AdminGuard } from '../../../../shared/guards/admin.guard';
import { CreateOrderDto } from '../../application/dto/create-order.dto';
import { UpdateStatusDto } from '../../application/dto/update-status.dto';
import { CreateOrderUseCase } from '../../application/use-cases/create-order.use-case';
import { GetOrdersUseCase } from '../../application/use-cases/get-orders.use-case';
import { GetOrderUseCase } from '../../application/use-cases/get-order.use-case';
import { CancelOrderUseCase } from '../../application/use-cases/cancel-order.use-case';
import { UpdateStatusUseCase } from '../../application/use-cases/update-status.use-case';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(
    private readonly createOrder: CreateOrderUseCase,
    private readonly getOrders: GetOrdersUseCase,
    private readonly getOrder: GetOrderUseCase,
    private readonly cancelOrder: CancelOrderUseCase,
    private readonly updateStatus: UpdateStatusUseCase,
  ) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateOrderDto,
    @Headers('authorization') authorization: string,
  ) {
    return this.createOrder.execute(user.userId, dto, authorization);
  }

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query('page') page = '1', @Query('limit') limit = '10') {
    return this.getOrders.execute(user.userId, +page, +limit);
  }

  @Get('admin/all')
  @UseGuards(AdminGuard)
  listAll(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.getOrders.execute('admin', +page, +limit);
  }

  @Get(':id')
  getOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.getOrder.execute(id, user.userId, user.roles?.includes('admin'));
  }

  @Put(':id/cancel')
  cancel(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.cancelOrder.execute(id, user.userId, user.roles?.includes('admin'));
  }

  @Put(':id/status')
  @UseGuards(AdminGuard)
  updateOrderStatus(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.updateStatus.execute(id, dto, user.userId);
  }
}
