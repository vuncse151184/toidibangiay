"use client"

import Image from "next/image"
import { useCallback, useRef, useState } from "react"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"

export interface ImageUploadProps {
  /** URL hiện tại (Cloudinary hoặc local path) */
  value: string
  /** Callback trả về URL sau khi upload xong */
  onChange: (url: string) => void
  /** Folder trên Cloudinary, mặc định "toidibangiay" */
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
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Chỉ chấp nhận file ảnh (JPG, PNG, WebP, ...)")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Ảnh vượt quá 5MB")
        return
      }

      setError(null)
      setUploading(true)

      try {
        const base64 = await readAsDataURL(file)

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64, folder }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error((data as { error?: string }).error ?? "Upload thất bại")
        }

        const data = await res.json() as { optimizedUrl: string }
        onChange(data.optimizedUrl)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload thất bại")
      } finally {
        setUploading(false)
      }
    },
    [folder, onChange],
  )

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (files?.[0]) upload(files[0])
    },
    [upload],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const handleClear = () => {
    onChange("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">
          {label}
        </label>
      )}

      {value ? (
        /* ── Preview ── */
        <div className="relative rounded-lg overflow-hidden border border-white/10 group">
          <div style={{ aspectRatio }}>
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized={value.startsWith("http")}
            />
          </div>

          {/* Overlay actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs font-medium transition-colors"
            >
              <Upload size={13} />
              Thay ảnh
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-400 text-xs font-medium transition-colors"
            >
              <X size={13} />
              Xóa
            </button>
          </div>

          {uploading && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <Loader2 size={24} className="text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        /* ── Drag & drop zone ── */
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => !uploading && inputRef.current?.click()}
          className={[
            "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed cursor-pointer transition-all select-none",
            dragOver
              ? "border-red-500/60 bg-red-500/5"
              : "border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04]",
          ].join(" ")}
          style={{ aspectRatio, minHeight: 100 }}
        >
          {uploading ? (
            <>
              <Loader2 size={24} className="text-white/40 animate-spin" />
              <span className="text-xs text-white/40">Đang upload...</span>
            </>
          ) : (
            <>
              <ImageIcon size={24} className="text-white/20" />
              <div className="text-center px-4">
                <p className="text-xs text-white/40">
                  {dragOver ? "Thả ảnh vào đây" : "Kéo thả hoặc click để chọn"}
                </p>
                <p className="text-[10px] text-white/20 mt-0.5">JPG, PNG, WebP — tối đa 5MB</p>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          <X size={11} />
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Không đọc được file"))
    reader.readAsDataURL(file)
  })
}
