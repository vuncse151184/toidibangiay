import { NextRequest, NextResponse } from "next/server";

const SEARCH_URL = process.env.SEARCH_SERVICE_URL ?? "http://localhost:3005";

const EMPTY = { products: [], total: 0, page: 1, limit: 20, totalPages: 0, facets: {} };

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams.toString();
  try {
    const res = await fetch(`${SEARCH_URL}/search?${params}`, { cache: "no-store" });
    if (!res.ok) return NextResponse.json(EMPTY);
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json(EMPTY);
  }
}