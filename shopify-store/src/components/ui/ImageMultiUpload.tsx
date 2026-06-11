"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { Plus, X } from "lucide-react"

interface Props {
  value: Array<File | string>
  onChange: (items: Array<File | string>) => void
  maxImages?: number
}

export default function ImageMultiUpload({ value = [], onChange, maxImages = 10 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const objectUrlsRef = useRef<Map<File, string>>(new Map())

  const getPreviewUrl = (item: File | string): string => {
    if (typeof item === "string") return item
    if (!objectUrlsRef.current.has(item)) {
      objectUrlsRef.current.set(item, URL.createObjectURL(item))
    }
    return objectUrlsRef.current.get(item)!
  }

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const remaining = maxImages - value.length
    onChange([...value, ...files.slice(0, remaining)])
    e.target.value = ""
  }

  return (
    <div className="flex flex-wrap gap-2">
      {value.map((item, i) => (
        <div
          key={i}
          className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10 group flex-shrink-0"
        >
          <Image src={getPreviewUrl(item)} alt="" fill className="object-cover" unoptimized />

          {i === 0 && (
            <span className="absolute bottom-0 inset-x-0 text-center text-[9px] bg-black/70 text-white/70 py-0.5">
              Chính
            </span>
          )}

          {item instanceof File && (
            <span className="absolute top-1 left-1 text-[9px] bg-amber-500/80 text-white px-1 py-0.5 rounded leading-none">
              Chưa lưu
            </span>
          )}

          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
          >
            <X size={10} className="text-white" />
          </button>
        </div>
      ))}

      {value.length < maxImages && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-24 h-24 rounded-xl border-2 border-dashed border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] flex flex-col items-center justify-center gap-1 transition-all flex-shrink-0"
          >
            <Plus size={18} className="text-white/30" />
            <span className="text-[10px] text-white/30">Thêm ảnh</span>
          </button>
        </>
      )}
    </div>
  )
}
