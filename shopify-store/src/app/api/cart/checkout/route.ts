import { NextRequest, NextResponse } from "next/server"
import { createBackendCheckout } from "@/services/cart.service"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items } = body as {
      items: { variantId: string; quantity: number }[]
    }

    if (!items?.length) {
      return NextResponse.json(
        { message: "Cart is empty" },
        { status: 400 }
      )
    }

    const result = await createBackendCheckout(items)

    return NextResponse.json({
      cartId: result.cartId,
      orderId: result.orderId,
      checkoutUrl: result.checkoutUrl,
    })
  } catch (error) {
    console.error("Failed to create backend checkout", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to create checkout" },
      { status: 500 }
    )
  }
}
