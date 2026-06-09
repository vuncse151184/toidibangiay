import { NextResponse } from "next/server"
import { getCollections } from "@/services/collection.service"

export async function GET() {
  try {
    const collections = await getCollections()
    return NextResponse.json(collections)
  } catch (error) {
    console.error("Failed to load collections from backend", error)
    return NextResponse.json({ message: "Failed to load collections" }, { status: 500 })
  }
}
