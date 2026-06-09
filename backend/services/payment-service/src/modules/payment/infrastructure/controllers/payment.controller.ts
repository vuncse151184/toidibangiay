import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreatePaymentDto } from '../../application/dto/create-payment.dto';
import { CreatePaymentUseCase } from '../../application/use-cases/create-payment.use-case';
import { VNPayReturnUseCase } from '../../application/use-cases/vnpay-return.use-case';
import { GetPaymentUseCase } from '../../application/use-cases/get-payment.use-case';
import { MomoNotifyUseCase } from '../../application/use-cases/momo-notify.use-case';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly createPayment: CreatePaymentUseCase,
    private readonly vnpayReturn: VNPayReturnUseCase,
    private readonly getPayment: GetPaymentUseCase,
    private readonly momoNotifyUseCase: MomoNotifyUseCase,
  ) {}

  @Post('create')
  create(@Body() dto: CreatePaymentDto) { return this.createPayment.execute(dto); }

  @Get('vnpay/return')
  vnpayReturnHandler(@Query() query: Record<string, string>) {
    return this.vnpayReturn.execute(query);
  }

  @Post('momo/notify')
  momoNotify(@Body() body: Record<string, any>) {
    return this.momoNotifyUseCase.execute(body);
  }

  @Get(':orderId')
  getOne(@Param('orderId') orderId: string) { return this.getPayment.execute(orderId); }
}
