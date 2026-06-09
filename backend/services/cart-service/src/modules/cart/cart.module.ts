import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { env } from '../../shared/config/env';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../shared/guards/optional-jwt-auth.guard';
import { ProductClientService } from '../../shared/product-client/product-client.service';
import { GetCartUseCase } from './application/use-cases/get-cart.use-case';
import { AddItemUseCase } from './application/use-cases/add-item.use-case';
import { UpdateItemUseCase } from './application/use-cases/update-item.use-case';
import { RemoveItemUseCase } from './application/use-cases/remove-item.use-case';
import { ClearCartUseCase } from './application/use-cases/clear-cart.use-case';
import { MergeCartUseCase } from './application/use-cases/merge-cart.use-case';
import { CART_REPOSITORY } from './domain/ports/cart.repository.port';
import { CartController } from './infrastructure/controllers/cart.controller';
import { PrismaCartRepository } from './infrastructure/persistence/prisma-cart.repository';

@Module({
  imports: [
    JwtModule.register({ secret: env.JWT_ACCESS_SECRET }),
  ],
  controllers: [CartController],
  providers: [
    JwtAuthGuard,
    OptionalJwtAuthGuard,
    ProductClientService,
    GetCartUseCase,
    AddItemUseCase,
    UpdateItemUseCase,
    RemoveItemUseCase,
    ClearCartUseCase,
    MergeCartUseCase,
    { provide: CART_REPOSITORY, useClass: PrismaCartRepository },
  ],
})
export class CartModule {}
