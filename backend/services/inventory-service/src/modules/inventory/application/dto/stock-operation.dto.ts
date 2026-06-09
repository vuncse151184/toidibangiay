import { IsArray, IsInt, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StockItemDto {
  @IsString() variantId: string;
  @IsInt() @IsPositive() quantity: number;
}

export class StockOperationDto {
  @IsString() orderId: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => StockItemDto)
  items: StockItemDto[];
}

export class RestockDto {
  @IsString() variantId: string;
  @IsInt() @IsPositive() quantity: number;
  @IsOptional() @IsString() note?: string;
}
