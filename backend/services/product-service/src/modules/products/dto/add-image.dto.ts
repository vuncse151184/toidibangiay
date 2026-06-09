import { IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class AddImageDto {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
