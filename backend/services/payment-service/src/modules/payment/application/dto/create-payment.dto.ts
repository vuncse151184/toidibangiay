import { IsEnum, IsInt, IsPositive, IsUUID } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID() orderId: string;
  @IsInt() @IsPositive() amount: number;
  @IsEnum(['VNPAY', 'MOMO', 'COD']) method: 'VNPAY' | 'MOMO' | 'COD';
}
