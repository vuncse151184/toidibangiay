import { Module } from '@nestjs/common';
import { PrismaModule } from './shared/database/prisma.module';
import { OrderModule } from './modules/order/order.module';

@Module({
  imports: [PrismaModule, OrderModule],
})
export class AppModule {}
