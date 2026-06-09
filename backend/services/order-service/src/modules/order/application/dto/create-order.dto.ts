import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class ShippingAddressDto {
  @IsString() fullName: string;
  @IsString() phone: string;
  @IsString() street: string;
  @IsString() ward: string;
  @IsString() district: string;
  @IsString() city: string;
}

export class CreateOrderDto {
  @IsEnum(['VNPAY', 'MOMO', 'COD'])
  paymentMethod: 'VNPAY' | 'MOMO' | 'COD';

  @IsOptional() @IsString() note?: string;

  @IsOptional() @Type(() => ShippingAddressDto)
  shippingAddress?: ShippingAddressDto;
}
