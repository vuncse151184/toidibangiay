export async function uploadFileToCloudinary(file: File, folder: string): Promise<string> {
  const timestamp = Math.round(Date.now() / 1000)
  const paramsToSign: Record<string, string> = { folder, timestamp: String(timestamp) }

  const { signature } = await fetch("/api/sign-cloudinary-params", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paramsToSign }),
  }).then((r) => r.json())

  const formData = new FormData()
  formData.append("file", file)
  formData.append("folder", folder)
  formData.append("timestamp", String(timestamp))
  formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!)
  formData.append("signature", signature)

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message ?? "Upload thất bại")
  return data.secure_url as string
}

export function countPendingFiles(images: Array<File | string>): number {
  return images.filter((img) => img instanceof File).length
}
