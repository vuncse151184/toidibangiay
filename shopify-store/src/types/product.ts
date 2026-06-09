export interface ProductImage {
  id?: string
  url: string
  altText: string | null
  position?: number
}

export interface ProductPrice {
  amount: string
  currencyCode: string
}

export interface ProductVariant {
  id: string
  title: string
  price: ProductPrice
  compareAtPrice: ProductPrice | null
  availableForSale: boolean
  selectedOptions: { name: string; value: string }[]
}

export interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  endCursor: string | null
  startCursor: string | null
}

export interface Product {
  id: string
  title: string
  handle: string
  description: string
  tags: string[]
  images: ProductImage[]
  variants: ProductVariant[]
  vendor?: string
  productType?: string
}

export interface ProductsPage {
  products: Product[]
  pageInfo: PageInfo
}
