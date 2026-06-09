import { NextRequest, NextResponse } from "next/server"
import { getProductByHandle } from "@/services/product.service"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params
    const product = await getProductByHandle(handle)

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Failed to load product from backend", error)
    return NextResponse.json({ message: "Failed to load product" }, { status: 500 })
  }
}
