import { CartView } from '../models/cart';

export const CART_REPOSITORY = Symbol('CART_REPOSITORY');

export interface AddItemInput {
  userId: string;
  productId: string;
  variantId: string;
  productName: string;
  variantLabel?: string;
  imageUrl?: string;
  unitPrice: string;
  quantity: number;
}

export interface CartRepositoryPort {
  getByUserId(userId: string): Promise<CartView | null>;
  addOrUpdateItem(input: AddItemInput): Promise<CartView>;
  updateItemQuantity(userId: string, variantId: string, quantity: number): Promise<CartView>;
  removeItem(userId: string, variantId: string): Promise<CartView>;
  clear(userId: string): Promise<void>;
  mergeGuestCart(guestUserId: string, userId: string): Promise<CartView>;
}
