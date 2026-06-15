"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Plus, Upload, X } from "lucide-react"

interface Props {
  value: Array<File | string>
  onChange: (items: Array<File | string>) => void
  maxImages?: number
}

export default function ImageMultiUpload({ value = [], onChange, maxImages = 10 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const objectUrlsRef = useRef<Map<File, string>>(new Map())
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  const getPreviewUrl = (item: File | string): string => {
    if (typeof item === "string") return item
    if (!objectUrlsRef.current.has(item)) {
      objectUrlsRef.current.set(item, URL.createObjectURL(item))
    }
    return objectUrlsRef.current.get(item)!
  }

  useEffect(() => {
    return () => objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  const addFiles = useCallback(
    (files: File[]) => {
      const images = files.filter((f) => f.type.startsWith("image/"))
      if (!images.length) return
      const remaining = maxImages - value.length
      onChange([...value, ...images.slice(0, remaining)])
    },
    [value, onChange, maxImages],
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files ?? []))
    e.target.value = ""
  }

  const canAddMore = value.length < maxImages

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    if (--dragCounter.current === 0) setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)
    addFiles(Array.from(e.dataTransfer.files))
  }

  return (
    <div
      className={`relative rounded-xl border-2 border-dashed p-3 transition-all duration-200 ${
        isDragging
          ? "border-red-500 bg-red-500/[0.06]"
          : "border-white/10 bg-white/[0.02] hover:border-white/20"
      }`}
      onDragEnter={canAddMore ? handleDragEnter : undefined}
      onDragLeave={canAddMore ? handleDragLeave : undefined}
      onDragOver={canAddMore ? (e) => e.preventDefault() : undefined}
      onDrop={canAddMore ? handleDrop : undefined}
    >
      {isDragging && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl pointer-events-none">
          <Upload size={28} className="text-red-400 mb-1" />
          <span className="text-sm font-medium text-red-400">Thả ảnh vào đây</span>
        </div>
      )}

      <div className={`flex flex-wrap gap-2 ${isDragging ? "opacity-20" : ""}`}>
        {value.map((item, i) => (
          <div
            key={i}
            className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 group"
          >
            <Image src={getPreviewUrl(item)} alt="" fill className="object-cover" unoptimized />
            {i === 0 && (
              <span className="absolute bottom-0 inset-x-0 bg-black/70 py-0.5 text-center text-[9px] text-white/70">
                Chính
              </span>
            )}
            {item instanceof File && (
              <span className="absolute top-1 left-1 rounded px-1 py-0.5 text-[9px] leading-none bg-amber-500/80 text-white">
                Chưa lưu
              </span>
            )}
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 opacity-0 transition-all hover:bg-red-500 group-hover:opacity-100"
            >
              <X size={10} className="text-white" />
            </button>
          </div>
        ))}

        {canAddMore && (
          <>
            <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-24 w-24 flex-shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] transition-all hover:border-white/20 hover:bg-white/[0.04]"
            >
              <Plus size={18} className="text-white/30" />
              <span className="text-[10px] text-white/30">Thêm ảnh</span>
            </button>
          </>
        )}
      </div>

      {value.length === 0 && !isDragging && (
        <div className="flex cursor-pointer flex-col items-center justify-center py-6" onClick={() => inputRef.current?.click()}>
          <Upload size={24} className="mb-2 text-white/20" />
          <p className="text-sm text-white/30">Kéo &amp; thả ảnh vào đây</p>
          <p className="mt-0.5 text-xs text-white/20">hoặc click để chọn file</p>
        </div>
      )}
    </div>
  )
}
