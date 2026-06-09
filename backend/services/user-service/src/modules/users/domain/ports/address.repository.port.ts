import { UserAddressView } from '../models/user-address';

export const ADDRESS_REPOSITORY = Symbol('ADDRESS_REPOSITORY');

export interface CreateAddressInput {
  userId: string;
  label?: string;
  recipientName: string;
  phone: string;
  countryCode: string;
  province: string;
  district: string;
  ward?: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode?: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
  type: 'SHIPPING' | 'BILLING' | 'BOTH';
}

export interface AddressRepositoryPort {
  listByUserId(userId: string): Promise<UserAddressView[]>;
  create(input: CreateAddressInput): Promise<UserAddressView>;
}
