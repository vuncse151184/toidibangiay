import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, Max } from 'class-validator';

export class AddItemDto {
  @ApiProperty({ example: 'variant-uuid-123' })
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  @Max(99)
  quantity: number;
}
