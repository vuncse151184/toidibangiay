import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

/** Build URL đầy đủ từ Cloudinary public_id (server-safe). */
export function buildCloudinaryUrl(publicIdOrUrl: string): string {
  if (!publicIdOrUrl || publicIdOrUrl.startsWith("http")) return publicIdOrUrl
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicIdOrUrl}`
}
