import type { PageInfo, Product, ProductsPage } from "@/types/product"
import { backendFetch, type BackendProduct } from "./backend-api.service"

type GetProductsPageOptions = {
  first?: number
  after?: string | null
}

type BackendProductsResponse = BackendProduct[] | { data: BackendProduct[] }

function normalizeProductsResponse(response: BackendProductsResponse): BackendProduct[] {
  return Array.isArray(response) ? response : response.data
}

function mapProduct(product: BackendProduct): Product {
  return {
    id: product.id,
    title: product.name,
    handle: product.slug ?? product.id,
    description: product.description ?? "",
    tags: [product.brand, product.category?.name].filter(Boolean) as string[],
    images: (product.images ?? [])
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((image) => ({
        url: image.url,
        altText: image.alt ?? null,
      })),
    variants: (product.variants ?? []).map((v) => ({
      id: v.id,
      title: [v.color, v.size].filter((x) => x !== undefined && x !== null && x !== "").join(" / "),
      price: {
        amount: String(v.price),
        currencyCode: "VND",
      },
      compareAtPrice: v.compareAtPrice != null
        ? { amount: String(v.compareAtPrice), currencyCode: "VND" }
        : null,
      availableForSale: v.stock > 0,
      selectedOptions: [
        ...(v.color ? [{ name: "Color", value: v.color }] : []),
        ...(v.size !== undefined && v.size !== null ? [{ name: "Size", value: String(v.size) }] : []),
      ],
    })),
    vendor: product.brand,
    productType: product.category?.name,
  }
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

async function fetchBackendProducts() {
  return normalizeProductsResponse(
    await backendFetch<BackendProductsResponse>("/products")
  )
}

export async function getProductsPage({
  first = 20,
  after = null,
}: GetProductsPageOptions = {}): Promise<ProductsPage> {
  const products = await fetchBackendProducts()
  const start = after ? Number.parseInt(after, 10) : 0
  const offset = Number.isFinite(start) && start > 0 ? start : 0
  const pageSize = Number.isFinite(first) && first > 0 ? first : 20
  const pageProducts = products.slice(offset, offset + pageSize)

  return {
    products: pageProducts.map(mapProduct),
    pageInfo: mapPageInfo(offset, pageProducts.length, products.length),
  }
}

export async function getProducts(): Promise<Product[]> {
  const products = await fetchBackendProducts()
  return products.map(mapProduct)
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  try {
    const product = await backendFetch<BackendProduct>(`/products/${encodeURIComponent(handle)}`)
    return product ? mapProduct(product) : null
  } catch {
    return null
  }
}
