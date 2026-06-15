"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { SlidersHorizontal, X, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import InfiniteProductGrid from "@/components/product/InfiniteProductGrid"
import ShoeFilter, { type ShoeFilters } from "@/components/product/ShoeFilter"
import type { Product } from "@/types/product"
import type { Collection } from "@/types/collection"

const defaultFilters: ShoeFilters = {
  priceRange: [0, 5000000],
  sizes: [],
  availability: "all",
  sortBy: "default",
}

const PAGE_SIZE = 20

function toOsSort(sortBy: ShoeFilters["sortBy"]): string {
  switch (sortBy) {
    case "price-asc":  return "price_asc"
    case "price-desc": return "price_desc"
    case "name-asc":   return "newest"
    case "name-desc":  return "popular"
    default:           return "popular"
  }
}

function osToProduct(p: any): Product {
  return {
    id: p.id,
    title: p.name,
    handle: p.slug,
    description: p.description ?? "",
    tags: p.tags ?? [],
    vendor: p.brand,
    productType: p.categoryName,
    images: p.imageUrl ? [{ url: p.imageUrl, altText: p.name }] : [],
    variants: [{
      id: `${p.id}-v`,
      title: "Default",
      price: { amount: String(p.minPrice ?? 0), currencyCode: "VND" },
      compareAtPrice: null,
      availableForSale: true,
      selectedOptions: [],
    }],
  }
}

function buildQs(filters: ShoeFilters, page: number): string {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
    sort: toOsSort(filters.sortBy),
  })
  if (filters.priceRange[0] > 0)       qs.set("minPrice", String(filters.priceRange[0]))
  if (filters.priceRange[1] < 5000000) qs.set("maxPrice", String(filters.priceRange[1]))
  if (filters.sizes.length)            qs.set("sizes", filters.sizes.join(","))
  return qs.toString()
}

export default function ShopCatalogClient() {
  const [filters, setFilters] = useState<ShoeFilters>(defaultFilters)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => {
    fetch("/api/collections")
      .then(r => r.ok ? r.json() : [])
      .then((data: Collection[]) => setCollections(data.filter(c => c.products.length > 0).slice(0, 8)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)

    fetch(`/api/search?${buildQs(filters, 1)}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => {
        if (cancelled) return
        setProducts((data.products ?? []).map(osToProduct))
        setTotalPages(data.totalPages ?? 1)
        setTotal(data.total ?? 0)
        setPage(1)
      })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [filters])

  async function handleLoadMore() {
    if (loadingMore || page >= totalPages) return
    const next = page + 1
    setLoadingMore(true)
    try {
      const res = await fetch(`/api/search?${buildQs(filters, next)}`)
      const data = await res.json()
      setProducts(prev => {
        const ids = new Set(prev.map(p => p.id))
        return [...prev, ...(data.products ?? []).map(osToProduct).filter((p: Product) => !ids.has(p.id))]
      })
      setPage(next)
    } finally {
      setLoadingMore(false)
    }
  }

  const hasMore = page < totalPages
  const resetKey = `${filters.sortBy}-${filters.sizes.join(",")}-${filters.priceRange.join("-")}`

  return (
    <div className="min-h-screen bg-black">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_50%_0%,rgba(220,38,38,0.15),transparent_60%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-8 pt-28 pb-20">
        <div className="mb-14 md:mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-red-500" />
            <span className="text-red-500 text-xs font-bold tracking-[0.3em] uppercase">Shop</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-[var(--font-display)] tracking-tight text-white">
            Sneaker chính hãng cho thị trường Việt Nam
          </h1>
          <p className="mt-4 text-sm md:text-base text-white/40 max-w-2xl leading-relaxed">
            Tập hợp những mẫu sneaker, streetwear và phối màu nổi bật đang có tại Toidibangiay.
            Lọc nhanh theo giá, size và tình trạng bán để tìm đúng sản phẩm bạn cần.
          </p>
        </div>

        {collections.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-white/30">Collections</span>
              <Link
                href="/collections"
                className="group flex items-center gap-1.5 text-[11px] font-bold tracking-[0.2em] uppercase text-white/25 hover:text-red-400 transition-colors"
              >
                Xem tất cả
                <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
              {collections.map((col) => {
                const img = col.image?.url ?? col.products[0]?.images[0]?.url
                return (
                  <Link
                    key={col.id}
                    href={`/collections/${col.handle}`}
                    className="group relative flex-shrink-0 snap-start w-36 md:w-44 rounded-xl overflow-hidden border border-white/[0.07] hover:border-red-500/30 transition-[border-color,box-shadow] duration-300 hover:shadow-[0_4px_20px_rgba(220,38,38,0.1)]"
                  >
                    <div className="relative aspect-[4/3] bg-neutral-900">
                      {img ? (
                        <Image
                          src={img}
                          alt={col.title}
                          fill
                          sizes="176px"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 inset-x-0 p-3">
                      <p className="text-white text-xs font-bold leading-tight truncate">{col.title}</p>
                      <p className="text-white/40 text-[10px] mt-0.5">{col.products.length} sản phẩm</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-10 text-center">
            <p className="text-red-400 text-sm">Không thể tải danh sách sản phẩm lúc này</p>
            <p className="text-white/30 text-xs mt-1">Vui lòng thử lại sau</p>
          </div>
        ) : (
          <>
            {/* Mobile filter toggle — always visible once not error */}
            {!loading && (
              <div className="lg:hidden mb-6">
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase border border-white/[0.1] bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white/70 transition-all"
                >
                  <SlidersHorizontal size={14} />
                  Bộ lọc
                </button>
              </div>
            )}

            <div className="flex gap-8">
              {/* Sidebar filter — always visible */}
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="hidden lg:block flex-shrink-0 w-[260px]"
              >
                <div className="sticky top-28 bg-white/[0.1] border border-white/[0.08] rounded-2xl p-5">
                  <ShoeFilter filters={filters} onChange={setFilters} totalResults={total} />
                </div>
              </motion.aside>

              {/* Mobile drawer */}
              {mobileFilterOpen && (
                <>
                  <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
                    onClick={() => setMobileFilterOpen(false)}
                  />
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className="fixed left-0 top-0 h-full w-[300px] bg-neutral-950 border-r border-white/[0.08] z-[61] p-6 overflow-y-auto lg:hidden"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-sm font-bold text-white tracking-wider uppercase">Bộ lọc</span>
                      <button onClick={() => setMobileFilterOpen(false)} className="text-white/40 hover:text-white">
                        <X size={20} />
                      </button>
                    </div>
                    <ShoeFilter filters={filters} onChange={setFilters} totalResults={total} />
                  </motion.div>
                </>
              )}

              {/* Content area */}
              <div className="flex-1 min-w-0">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <span className="text-white/30 text-xs tracking-wider uppercase animate-pulse">Đang tải...</span>
                  </div>
                ) : products.length === 0 ? (
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-12 text-center">
                    <p className="text-white/50">Không tìm thấy sản phẩm phù hợp</p>
                    <button
                      onClick={() => setFilters(defaultFilters)}
                      className="mt-3 text-red-500 text-xs font-bold tracking-wider uppercase hover:text-red-400 transition-colors"
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                ) : (
                  <InfiniteProductGrid
                    products={products}
                    hasMore={hasMore}
                    isLoadingMore={loadingMore}
                    onLoadMore={handleLoadMore}
                    resetKey={resetKey}
                    delay={0.2}
                    itemDuration={0.35}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6"
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
