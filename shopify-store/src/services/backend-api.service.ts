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

// Fail fast instead of hanging when the backend is slow or unreachable (e.g.
// during a Vercel build when the EKS backend is behind a flaky tunnel). Without
// this, fetch can hang past Next's 60s route-build limit and abort the deploy.
const parsedTimeout = Number(process.env.BACKEND_API_TIMEOUT_MS)
const BACKEND_API_TIMEOUT_MS =
  Number.isFinite(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : 10_000

export async function backendFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getBackendApiBaseUrl()}${path}`, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(BACKEND_API_TIMEOUT_MS),
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
