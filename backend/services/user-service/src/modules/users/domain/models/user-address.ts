export interface UserAddressView {
  id: string;
  label: string | null;
  recipientName: string;
  phone: string;
  countryCode: string;
  province: string;
  district: string;
  ward: string | null;
  addressLine1: string;
  addressLine2: string | null;
  postalCode: string | null;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  type: string;
}
