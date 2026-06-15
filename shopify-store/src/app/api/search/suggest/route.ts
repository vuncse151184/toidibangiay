import { NextRequest, NextResponse } from "next/server"

const SEARCH_URL = process.env.SEARCH_SERVICE_URL ?? "http://localhost:3005"

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? ""
  if (q.trim().length < 2) return NextResponse.json([])
  try {
    const res = await fetch(`${SEARCH_URL}/search/suggest?q=${encodeURIComponent(q)}`, { cache: "no-store" })
    if (!res.ok) return NextResponse.json([])
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json([])
  }
}