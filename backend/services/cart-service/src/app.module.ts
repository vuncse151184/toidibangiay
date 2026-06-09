import { Module } from '@nestjs/common';

import { CartModule } from './modules/cart/cart.module';
import { PrismaModule } from './shared/database/prisma.module';

@Module({
  imports: [PrismaModule, CartModule],
})
export class AppModule {}
