import type { PageInfo, Product, ProductImage } from "./product"

export interface Collection {
  id: string
  title: string
  handle: string
  description: string
  image: ProductImage | null
  products: Product[]
}

export interface CollectionPage extends Collection {
  pageInfo: PageInfo
}
