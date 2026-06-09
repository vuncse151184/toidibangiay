import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { env } from '../../shared/config/env';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { GetOrdersUseCase } from './application/use-cases/get-orders.use-case';
import { GetOrderUseCase } from './application/use-cases/get-order.use-case';
import { CancelOrderUseCase } from './application/use-cases/cancel-order.use-case';
import { UpdateStatusUseCase } from './application/use-cases/update-status.use-case';
import { OrderController } from './infrastructure/controllers/order.controller';

@Module({
  imports: [JwtModule.register({ secret: env.JWT_ACCESS_SECRET })],
  controllers: [OrderController],
  providers: [JwtAuthGuard, CreateOrderUseCase, GetOrdersUseCase, GetOrderUseCase, CancelOrderUseCase, UpdateStatusUseCase],
})
export class OrderModule {}
