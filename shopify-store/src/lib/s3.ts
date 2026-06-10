import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import sharp from "sharp"
import { randomBytes } from "crypto"

// ─── S3 Client (server-side only) ─────────────────────────────────────────────
export const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
})

const BUCKET = process.env.AWS_S3_BUCKET ?? ""

// CloudFront URL nếu có, fallback về S3 public URL
const CDN_BASE =
  process.env.NEXT_PUBLIC_CDN_URL ??
  `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION ?? "ap-southeast-1"}.amazonaws.com`

// ─── Types ────────────────────────────────────────────────────────────────────
export interface UploadResult {
  url: string          // URL cuối — CloudFront hoặc S3
  optimizedUrl: string // Alias của url (giữ tương thích với API cũ)
  key: string          // S3 object key
  width: number
  height: number
  format: string       // "webp"
  bytes: number
}

// ─── Upload ───────────────────────────────────────────────────────────────────
/**
 * Upload ảnh lên S3 với tối ưu sharp (→ WebP, quality 85, max 2000×2000).
 * Trả về CloudFront URL nếu `NEXT_PUBLIC_CDN_URL` được cấu hình.
 *
 * @param fileBase64  data URL: "data:image/png;base64,..."
 * @param folder      S3 key prefix, ví dụ "toidibangiay/hero"
 */
export async function uploadToS3(
  fileBase64: string,
  folder = "toidibangiay",
): Promise<UploadResult> {
  // Base64 data URL → Buffer
  const base64Data = fileBase64.replace(/^data:image\/\w+;base64,/, "")
  const inputBuffer = Buffer.from(base64Data, "base64")

  // ── Tối ưu bằng sharp ─────────────────────────────────────────────────────
  const transformer = sharp(inputBuffer)
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })

  const outputBuffer = await transformer.toBuffer()
  const { width = 0, height = 0 } = await sharp(outputBuffer).metadata()

  // ── S3 key: folder/timestamp-random.webp ─────────────────────────────────
  const id = randomBytes(8).toString("hex")
  const key = `${folder}/${Date.now()}-${id}.webp`

  // ── Upload ────────────────────────────────────────────────────────────────
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: outputBuffer,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  )

  const url = `${CDN_BASE}/${key}`

  return {
    url,
    optimizedUrl: url,
    key,
    width,
    height,
    format: "webp",
    bytes: outputBuffer.length,
  }
}

// ─── URL helpers ──────────────────────────────────────────────────────────────
/**
 * Build URL đầy đủ từ S3 key (client-safe nếu dùng NEXT_PUBLIC_CDN_URL).
 */
export function buildS3Url(keyOrUrl: string): string {
  if (!keyOrUrl || keyOrUrl.startsWith("http")) return keyOrUrl
  const base =
    process.env.NEXT_PUBLIC_CDN_URL ??
    `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com`
  return `${base}/${keyOrUrl}`
}
