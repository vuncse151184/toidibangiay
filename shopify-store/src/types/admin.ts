export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"

export type PaymentMethod = "VNPAY" | "MOMO" | "COD"

export interface OrderItem {
  id: string
  variantId: string
  productName: string
  variantTitle: string
  price: number
  quantity: number
}

export interface OrderEvent {
  id: string
  status: OrderStatus
  note?: string
  createdBy?: string
  createdAt: string
}

export interface ShippingAddress {
  fullName: string
  phone: string
  address: string
  city?: string
  province?: string
  district?: string
}

export interface AdminOrder {
  id: string
  orderCode: string
  userId: string
  status: OrderStatus
  subtotal: number
  shippingFee: number
  discount: number
  total: number
  paymentMethod: PaymentMethod
  shippingAddress: ShippingAddress
  note?: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  events: OrderEvent[]
}

export interface AdminProductVariant {
  id: string
  sku: string
  size: string
  color: string
  price: number
  compareAtPrice?: number
  stock: number
  isActive: boolean
  image?: string
}

export interface AdminCategory {
  id: string
  name: string
  slug: string
  children: AdminCategory[]
}

export interface AdminProductImage {
  id: string
  url: string
  altText?: string
  position: number
}

export interface AdminProduct {
  id: string
  name: string
  slug: string
  brand?: string
  description?: string
  isActive: boolean
  category?: { id: string; name: string; slug: string }
  images: AdminProductImage[]
  variants: AdminProductVariant[]
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
  variantId: string
  quantity: number
  reserved: number
  available: number
  updatedAt: string
}

export interface PaginatedMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}
