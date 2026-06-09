import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class CreateVariantInlineDto {
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

export class CreateProductDto {
  @ApiProperty({ example: 'Nike Air Max 270' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'nike-air-max-270', required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ example: 'Giày thể thao thoải mái', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Nike' })
  @IsNotEmpty()
  @IsString()
  brand: string;

  @ApiProperty({ example: 'cat-uuid-123', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ example: ['sneaker', 'running'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ type: [CreateVariantInlineDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantInlineDto)
  variants?: CreateVariantInlineDto[];
}
