import { NextRequest, NextResponse } from "next/server"
import { uploadToS3 } from "@/lib/s3"

// Giới hạn kích thước: 5MB
const MAX_BYTES = 5 * 1024 * 1024

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { file?: string; folder?: string }

    if (!body.file) {
      return NextResponse.json({ error: "Thiếu dữ liệu ảnh" }, { status: 400 })
    }

    // Chỉ chấp nhận data URL ảnh
    if (!body.file.startsWith("data:image/")) {
      return NextResponse.json({ error: "Chỉ chấp nhận file ảnh" }, { status: 400 })
    }

    // Ước tính size (base64 ≈ 4/3 kích thước gốc)
    const estimatedBytes = Math.ceil((body.file.length * 3) / 4)
    if (estimatedBytes > MAX_BYTES) {
      return NextResponse.json({ error: "Ảnh vượt quá 5MB" }, { status: 413 })
    }

    const result = await uploadToS3(body.file, body.folder ?? "toidibangiay")

    return NextResponse.json(result)
  } catch (err) {
    console.error("[upload] Lỗi upload S3:", err)
    return NextResponse.json({ error: "Upload thất bại" }, { status: 500 })
  }
}
