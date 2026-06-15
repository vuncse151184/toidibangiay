"use client"

import { useState, useEffect, useRef, useCallback, useTransition } from "react"
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
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const suggestRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    } else {
      setQuery("")
      startTransition(() => { setResults([]); setSuggestions([]) })
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
      startTransition(() => { setResults([]); setLoading(false) })
      return
    }
    setLoading(true)
    try {
      const res = await backendClientFetch<{ data: SearchProduct[] }>(
        `/products?q=${encodeURIComponent(q)}&limit=6`
      )
      startTransition(() => { setResults(res.data); setLoading(false) })
    } catch {
      startTransition(() => { setResults([]); setLoading(false) })
    }
  }, [])

  const doSuggest = useCallback(async (q: string) => {
    if (q.trim().length < 2) { startTransition(() => setSuggestions([])); return }
    try {
      const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}`)
      const data: string[] = await res.json()
      startTransition(() => setSuggestions(data.slice(0, 6)))
    } catch {
      startTransition(() => setSuggestions([]))
    }
  }, [])

  // Input update must stay synchronous (critical for INP); only results are deferred
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (suggestRef.current) clearTimeout(suggestRef.current)
    suggestRef.current = setTimeout(() => doSuggest(value), 150)
    debounceRef.current = setTimeout(() => doSearch(value), 300)
  }

  const applySuggestion = (s: string) => {
    setQuery(s)
    startTransition(() => setSuggestions([]))
    if (debounceRef.current) clearTimeout(debounceRef.current)
    doSearch(s)
  }

  const showResults = query.trim().length > 0

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
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-[81] bg-black/95 border-b border-white/[0.08] p-4 md:p-6"
          >
            <div className="max-w-2xl mx-auto">
              {/* Input row */}
              <div className="flex items-center gap-3">
                <Search size={18} className="text-white/35 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={handleChange}
                  placeholder="Tìm kiếm sản phẩm..."
                  autoComplete="off"
                  className="flex-1 bg-transparent text-white text-lg placeholder:text-white/25 focus:outline-none"
                />
                {(loading || isPending) && (
                  <span className="w-4 h-4 border-[1.5px] border-red-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                )}
                <button
                  onClick={onClose}
                  className="text-white/35 hover:text-white transition-colors flex-shrink-0 p-1"
                  aria-label="Đóng tìm kiếm"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Results — CSS opacity only, no height animation (height animation forces layout reflow on every keystroke) */}
              <div
                className="mt-4 overflow-hidden transition-opacity duration-150"
                style={{ opacity: showResults ? 1 : 0, pointerEvents: showResults ? "auto" : "none" }}
              >
                {suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => applySuggestion(s)}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-white/[0.06] border border-white/[0.1] text-white/60 hover:bg-white/[0.1] hover:text-white hover:border-red-500/30 transition-all duration-150 truncate max-w-[200px]"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {showResults && (
                  <>
                    {!loading && !isPending && results.length === 0 && (
                      <p className="py-6 text-center text-white/30 text-sm">
                        Không tìm thấy sản phẩm nào
                      </p>
                    )}

                    {results.length > 0 && (
                      <div className="space-y-0.5">
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
                              className="flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-colors duration-100 group"
                            >
                              <div className="w-11 h-11 rounded-lg bg-white/[0.04] overflow-hidden flex-shrink-0">
                                {image && (
                                  <Image
                                    src={image}
                                    alt={product.name}
                                    width={44}
                                    height={44}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{product.name}</p>
                                <p className="text-white/35 text-xs mt-0.5">{product.brand ?? ""}</p>
                              </div>
                              {minPrice !== null && (
                                <span className="text-white/55 text-sm flex-shrink-0 tabular-nums">{formatVND(minPrice)}</span>
                              )}
                              <ArrowRight size={13} className="text-white/15 group-hover:text-white/45 transition-colors flex-shrink-0" />
                            </Link>
                          )
                        })}

                        <Link
                          href={`/products?q=${encodeURIComponent(query)}`}
                          onClick={onClose}
                          className="flex items-center justify-center gap-2 py-3 text-sm text-red-400 hover:text-red-300 transition-colors font-medium"
                        >
                          Xem tất cả kết quả cho &quot;{query}&quot;
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
