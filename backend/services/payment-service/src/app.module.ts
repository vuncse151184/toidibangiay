import { Module } from '@nestjs/common';
import { PrismaModule } from './shared/database/prisma.module';
import { PaymentModule } from './modules/payment/payment.module';

@Module({ imports: [PrismaModule, PaymentModule] })
export class AppModule {}
