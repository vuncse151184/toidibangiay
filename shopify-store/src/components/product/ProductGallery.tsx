"use client"

import Image from "next/image"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { ProductImage } from "@/types/product"

type Props = {
  images: ProductImage[]
}

export default function ProductGallery({ images }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = images[activeIndex]

  if (!images.length) {
    return (
      <div className="aspect-square rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
        <svg className="w-20 h-20 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={activeImage.url}
              alt={`Product image ${activeIndex + 1}`}
              fill
              priority={activeIndex === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Image counter */}
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white/70 text-xs px-3 py-1.5 rounded-full font-medium">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-300 ${
                i === activeIndex
                  ? "border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                  : "border-white/[0.08] hover:border-white/20 opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt={`Thumbnail ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
