import "server-only"
import type { Collection, CollectionPage } from "@/types/collection"
import type { PageInfo, Product } from "@/types/product"
import { backendFetch, type BackendCategory } from "./backend-api.service"
import { getProducts } from "./product.service"

type GetCollectionPageOptions = {
  first?: number
  after?: string | null
}

function mapPageInfo(start: number, count: number, total: number): PageInfo {
  const nextOffset = start + count

  return {
    hasNextPage: nextOffset < total,
    hasPreviousPage: start > 0,
    endCursor: nextOffset < total ? String(nextOffset) : null,
    startCursor: count > 0 ? String(start) : null,
  }
}

function getCategoryHandle(category: BackendCategory) {
  return category.slug || category.id
}

function mapCollection(category: BackendCategory, products: Product[]): Collection {
  const collectionProducts = products.filter((product) =>
    category.products?.some((categoryProduct) => categoryProduct.id === product.id)
  )

  return {
    id: category.id,
    title: category.name,
    handle: getCategoryHandle(category),
    description: "",
    image: collectionProducts[0]?.images[0]
      ? { url: collectionProducts[0].images[0].url, altText: null }
      : null,
    products: collectionProducts,
  }
}

async function getBackendCategories() {
  return backendFetch<BackendCategory[]>("/categories")
}

export async function getCollections(): Promise<Collection[]> {
  const [categories, products] = await Promise.all([
    getBackendCategories(),
    getProducts(),
  ])

  return categories.map((category) => mapCollection(category, products))
}

export async function getCollectionByHandlePage(
  handle: string,
  { first = 20, after = null }: GetCollectionPageOptions = {}
): Promise<CollectionPage | null> {
  const collections = await getCollections()
  const collection = collections.find(
    (item) => item.handle === handle || item.id === handle
  )
  if (!collection) return null

  const start = after ? Number.parseInt(after, 10) : 0
  const offset = Number.isFinite(start) && start > 0 ? start : 0
  const pageSize = Number.isFinite(first) && first > 0 ? first : 20
  const pageProducts = collection.products.slice(offset, offset + pageSize)

  return {
    ...collection,
    products: pageProducts,
    pageInfo: mapPageInfo(offset, pageProducts.length, collection.products.length),
  }
}

export async function getCollectionByHandle(handle: string): Promise<Collection | null> {
  const collections = await getCollections()
  return collections.find((item) => item.handle === handle || item.id === handle) ?? null
}
