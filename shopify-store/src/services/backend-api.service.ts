import "server-only"

export type BackendCategory = {
  id: string
  name: string
  slug?: string | null
  products?: { id: string; name: string; brand?: string | null }[]
}

export type BackendProductImage = {
  id?: string
  url: string
  alt?: string | null
  position?: number | null
}

export type BackendProductVariant = {
  id: string
  sku: string
  color?: string | null
  size?: string | null
  price: string | number
  compareAtPrice?: string | number | null
  stock: number
}

export type BackendProduct = {
  id: string
  name: string
  slug?: string | null
  description?: string | null
  brand: string
  categoryId?: string | null
  category?: BackendCategory | null
  images?: BackendProductImage[]
  variants?: BackendProductVariant[]
}

export type BackendCheckoutResult = {
  cartId?: string
  orderId?: string
  checkoutUrl?: string
  redirectUrl?: string
}

export function getBackendApiBaseUrl() {
  return (
    process.env.BACKEND_API_URL ??
    process.env.PRODUCT_SERVICE_URL ??
    "http://localhost:4001"
  ).replace(/\/$/, "")
}

export async function backendFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getBackendApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Backend API request failed: ${response.status} ${message}`)
  }

  return response.json() as Promise<T>
}
