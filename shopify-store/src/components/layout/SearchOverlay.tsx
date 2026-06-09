"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { backendClientFetch } from "@/lib/backend-client"

interface SearchProduct {
  id: string
  name: string
  slug: string
  brand?: string
  images: { url: string }[]
  variants: { price: number }[]
}

const formatVND = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchProduct[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery("")
      setResults([])
    }
  }, [isOpen])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [onClose])

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const res = await backendClientFetch<{ data: SearchProduct[] }>(
        `/products?q=${encodeURIComponent(q)}&limit=6`
      )
      setResults(res.data)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 350)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 z-[81] bg-black/95 border-b border-white/[0.08] p-4 md:p-6"
          >
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-3">
                <Search size={20} className="text-white/40 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={handleChange}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="flex-1 bg-transparent text-white text-lg placeholder:text-white/30 focus:outline-none"
                />
                <button
                  onClick={onClose}
                  className="text-white/40 hover:text-white transition-colors flex-shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              <AnimatePresence>
                {(results.length > 0 || loading || query.trim()) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    {loading && (
                      <div className="py-6 text-center">
                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      </div>
                    )}

                    {!loading && query.trim() && results.length === 0 && (
                      <p className="py-6 text-center text-white/30 text-sm">
                        Không tìm thấy sản phẩm nào
                      </p>
                    )}

                    {!loading && results.length > 0 && (
                      <div className="space-y-1">
                        {results.map((product) => {
                          const image = product.images[0]?.url
                          const minPrice = product.variants.length
                            ? Math.min(...product.variants.map((v) => v.price))
                            : null

                          return (
                            <Link
                              key={product.id}
                              href={`/products/${product.slug}`}
                              onClick={onClose}
                              className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-white/[0.06] transition-colors group"
                            >
                              <div className="w-12 h-12 rounded-lg bg-white/[0.04] overflow-hidden flex-shrink-0">
                                {image && (
                                  <Image
                                    src={image}
                                    alt={product.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{product.name}</p>
                                <p className="text-white/40 text-xs mt-0.5">{product.brand || ""}</p>
                              </div>
                              {minPrice && (
                                <span className="text-white/60 text-sm flex-shrink-0">{formatVND(minPrice)}</span>
                              )}
                              <ArrowRight size={14} className="text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" />
                            </Link>
                          )
                        })}

                        <Link
                          href={`/products?q=${encodeURIComponent(query)}`}
                          onClick={onClose}
                          className="flex items-center justify-center gap-2 py-3 text-sm text-red-400 hover:text-red-300 transition-colors font-medium"
                        >
                          Xem tất cả kết quả cho &quot;{query}&quot;
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
