import { IsEmail, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export class SendNotificationDto {
  @IsOptional() @IsString() userId?: string;
  @IsEmail() toEmail: string;
  @IsEnum(['ORDER_CONFIRMED','ORDER_SHIPPED','ORDER_DELIVERED','ORDER_CANCELLED','PAYMENT_SUCCESS','PAYMENT_FAILED','WELCOME','PASSWORD_RESET'])
  type: string;
  @IsObject() payload: Record<string, unknown>;
}
