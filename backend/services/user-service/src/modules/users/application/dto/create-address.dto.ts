import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export const AddressTypeEnum = {
  SHIPPING: 'SHIPPING',
  BILLING: 'BILLING',
  BOTH: 'BOTH',
} as const;

export class CreateAddressDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  label?: string;

  @IsString()
  @MaxLength(120)
  recipientName!: string;

  @IsString()
  @MaxLength(30)
  phone!: string;

  @IsString()
  @MaxLength(2)
  countryCode!: string;

  @IsString()
  @MaxLength(120)
  province!: string;

  @IsString()
  @MaxLength(120)
  district!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  ward?: string;

  @IsString()
  @MaxLength(255)
  addressLine1!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @IsOptional()
  @IsBoolean()
  isDefaultShipping?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefaultBilling?: boolean;

  @IsEnum(AddressTypeEnum)
  type!: 'SHIPPING' | 'BILLING' | 'BOTH';
}
