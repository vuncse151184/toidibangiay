export interface CartItemView {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string | null;
  imageUrl: string | null;
  unitPrice: string;
  quantity: number;
  subtotal: string;
}

export interface CartView {
  id: string;
  userId: string;
  items: CartItemView[];
  totalItems: number;
  grandTotal: string;
}
