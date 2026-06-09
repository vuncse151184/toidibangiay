import { NextResponse } from "next/server"
import { getProducts, getProductsPage } from "@/services/product.service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const after = searchParams.get("after")
    const first = Number.parseInt(searchParams.get("first") ?? "20", 10)
    const paginated = searchParams.get("paginated") === "1" || after !== null

    if (paginated) {
      const page = await getProductsPage({
        after,
        first: Number.isFinite(first) ? first : 20,
      })

      return NextResponse.json(page)
    }

    const products = await getProducts()
    return NextResponse.json(products)
  } catch (error) {
    console.error("Failed to load products from backend", error)
    return NextResponse.json({ message: "Failed to load products" }, { status: 500 })
  }
}
