import { NextRequest, NextResponse } from "next/server"
import { getCollectionByHandle, getCollectionByHandlePage } from "@/services/collection.service"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params
    const after = req.nextUrl.searchParams.get("after")
    const first = Number.parseInt(req.nextUrl.searchParams.get("first") ?? "20", 10)
    const paginated = req.nextUrl.searchParams.get("paginated") === "1" || after !== null
    const collection = paginated
      ? await getCollectionByHandlePage(handle, {
          after,
          first: Number.isFinite(first) ? first : 20,
        })
      : await getCollectionByHandle(handle)

    if (!collection) {
      return NextResponse.json({ message: "Collection not found" }, { status: 404 })
    }

    return NextResponse.json(collection)
  } catch (error) {
    console.error("Failed to load collection from backend", error)
    return NextResponse.json({ message: "Failed to load collection" }, { status: 500 })
  }
}
