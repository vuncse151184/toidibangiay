import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthMiddleware } from './middleware/jwt-auth.middleware';
import { AuthProxyController } from './routes/auth-proxy.controller';
import { CartProxyController } from './routes/cart-proxy.controller';
import { CatalogProxyController } from './routes/catalog-proxy.controller';
import { CheckoutController } from './routes/checkout.controller';
import { InventoryProxyController } from './routes/inventory-proxy.controller';
import { OrderProxyController } from './routes/order-proxy.controller';
import { PaymentProxyController } from './routes/payment-proxy.controller';
import { BannersProxyController } from './routes/banners-proxy.controller';
import { ProxyService } from './routes/proxy.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 60000, limit: 100 },
    ]),
  ],
  controllers: [
    AuthProxyController,
    CartProxyController,
    CatalogProxyController,
    CheckoutController,
    OrderProxyController,
    PaymentProxyController,
    InventoryProxyController,
    BannersProxyController,
  ],
  providers: [ProxyService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtAuthMiddleware)
      .forRoutes(
        { path: 'checkout', method: RequestMethod.ALL },
        { path: 'checkout/(.*)', method: RequestMethod.ALL },
        { path: 'orders', method: RequestMethod.ALL },
        { path: 'orders/(.*)', method: RequestMethod.ALL },
        { path: 'payments/create', method: RequestMethod.ALL },
        { path: 'inventory/restock', method: RequestMethod.ALL },
      );
  }
}
