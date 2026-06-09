import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateVariantDto {
  @IsNotEmpty()
  @IsString()
  sku: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsOptional()
  @IsInt()
  compareAtPrice?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}
