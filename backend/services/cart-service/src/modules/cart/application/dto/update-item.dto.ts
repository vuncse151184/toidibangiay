import { IsInt, IsPositive, Max } from 'class-validator';

export class UpdateItemDto {
  @IsInt()
  @IsPositive()
  @Max(999)
  quantity: number;
}
