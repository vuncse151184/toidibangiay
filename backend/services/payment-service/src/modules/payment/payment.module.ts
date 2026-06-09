import { Module } from '@nestjs/common';
import { CreatePaymentUseCase } from './application/use-cases/create-payment.use-case';
import { VNPayReturnUseCase } from './application/use-cases/vnpay-return.use-case';
import { GetPaymentUseCase } from './application/use-cases/get-payment.use-case';
import { MomoNotifyUseCase } from './application/use-cases/momo-notify.use-case';
import { PaymentController } from './infrastructure/controllers/payment.controller';

@Module({
  controllers: [PaymentController],
  providers: [CreatePaymentUseCase, VNPayReturnUseCase, GetPaymentUseCase, MomoNotifyUseCase],
})
export class PaymentModule {}
