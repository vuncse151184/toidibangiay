import "server-only"
import {
  backendFetch,
  getBackendApiBaseUrl,
  type BackendCheckoutResult,
} from "./backend-api.service"

export interface CartLine {
  variantId: string
  quantity: number
}

export interface BackendCartResult {
  cartId?: string
  orderId?: string
  checkoutUrl: string
  totalQuantity: number
}

export async function createBackendCheckout(lines: CartLine[]): Promise<BackendCartResult> {
  const checkoutPath = process.env.BACKEND_CHECKOUT_PATH ?? "/checkout"
  const result = await backendFetch<BackendCheckoutResult>(checkoutPath, {
    method: "POST",
    body: JSON.stringify({ items: lines }),
  })

  const checkoutUrl = result.checkoutUrl ?? result.redirectUrl
  if (!checkoutUrl) {
    throw new Error(
      `Backend checkout response must include checkoutUrl or redirectUrl. Configure ${getBackendApiBaseUrl()}${checkoutPath} to create checkouts.`
    )
  }

  return {
    cartId: result.cartId,
    orderId: result.orderId,
    checkoutUrl,
    totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
  }
}
