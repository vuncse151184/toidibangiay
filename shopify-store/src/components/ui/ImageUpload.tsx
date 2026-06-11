"use client"

import Image from "next/image"
import { CldUploadWidget } from "next-cloudinary"
import { Upload, X, ImageIcon } from "lucide-react"
import type { CloudinaryUploadWidgetResults } from "next-cloudinary"

export interface ImageUploadProps {
  /** URL hiện tại */
  value: string
  /** Callback trả về secure_url sau khi upload xong */
  onChange: (url: string) => void
  /** Cloudinary folder prefix, mặc định "toidibangiay" */
  folder?: string
  /** Nhãn hiển thị */
  label?: string
  /** Tỉ lệ khung ảnh preview, ví dụ "16/9", "1/1" */
  aspectRatio?: string
  className?: string
}

export default function ImageUpload({
  value,
  onChange,
  folder = "toidibangiay",
  label,
  aspectRatio = "16/9",
  className = "",
}: ImageUploadProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
          {label}
        </label>
      )}

      <CldUploadWidget
        signatureEndpoint="/api/sign-cloudinary-params"
        options={{ folder, multiple: false, resourceType: "image" }}
        onSuccess={(result: CloudinaryUploadWidgetResults) => {
          const info = result?.info
          if (info && typeof info === "object" && "secure_url" in info) {
            onChange(info.secure_url)
          }
        }}
      >
        {({ open }) =>
          value ? (
            /* ── Preview ── */
            <div className="relative rounded-lg overflow-hidden border border-white/10 group">
              <div style={{ aspectRatio }}>
                <Image
                  src={value}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => open()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs font-medium transition-colors"
                >
                  <Upload size={13} />
                  Thay ảnh
                </button>
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-400 text-xs font-medium transition-colors"
                >
                  <X size={13} />
                  Xóa
                </button>
              </div>
            </div>
          ) : (
            /* ── Upload zone ── */
            <div
              onClick={() => open()}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed cursor-pointer transition-all select-none border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04]"
              style={{ aspectRatio, minHeight: 100 }}
            >
              <ImageIcon size={24} className="text-white/20" />
              <div className="text-center px-4">
                <p className="text-xs text-white/40">Click để chọn ảnh</p>
                <p className="text-[10px] text-white/20 mt-0.5">JPG, PNG, WebP, GIF</p>
              </div>
            </div>
          )
        }
      </CldUploadWidget>
    </div>
  )
}
