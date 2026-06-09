"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, SlidersHorizontal, X } from "lucide-react"
import Link from "next/link"
import InfiniteProductGrid from "@/components/product/InfiniteProductGrid"
import ShoeFilter, { applyFilters, type ShoeFilters } from "@/components/product/ShoeFilter"
import type { CollectionPage } from "@/types/collection"

const defaultFilters: ShoeFilters = {
  priceRange: [0, 500],
  sizes: [],
  availability: "all",
  sortBy: "default",
}

const COLLECTION_PAGE_SIZE = 20

async function fetchCollectionPage(handle: string, after: string): Promise<CollectionPage> {
  const response = await fetch(
    `/api/collections/${handle}?paginated=1&first=${COLLECTION_PAGE_SIZE}&after=${encodeURIComponent(after)}`
  )

  if (!response.ok) {
    throw new Error("Failed to fetch more collection products")
  }

  return response.json()
}

export default function CollectionDetailClient({
  handle,
  initialCollection,
}: {
  handle: string
  initialCollection: CollectionPage | null
}) {
  const [filters, setFilters] = useState<ShoeFilters>(defaultFilters)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [collection, setCollection] = useState(initialCollection)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)

  const filteredProducts = collection?.products
    ? applyFilters(collection.products, filters)
    : []
  const resetKey = `${handle}-${filteredProducts.length}-${collection?.pageInfo.endCursor ?? "end"}-${filters.priceRange[0]}-${filters.priceRange[1]}-${filters.availability}-${filters.sortBy}-${[...filters.sizes].sort((a, b) => a - b).join(",")}`

  async function handleLoadMore() {
    if (isLoadingMore || !collection?.pageInfo.hasNextPage || !collection.pageInfo.endCursor) return

    setIsLoadingMore(true)
    setLoadMoreError(null)

    try {
      const nextPage = await fetchCollectionPage(handle, collection.pageInfo.endCursor)

      setCollection((current) => {
        if (!current) return nextPage

        const currentIds = new Set(current.products.map((product) => product.id))
        const nextProducts = nextPage.products.filter((product) => !currentIds.has(product.id))

        return {
          ...current,
          products: [...current.products, ...nextProducts],
          pageInfo: nextPage.pageInfo,
        }
      })
    } catch {
      setLoadMoreError("Không thể tải thêm sản phẩm")
    } finally {
      setIsLoadingMore(false)
    }
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6">
        <p className="text-red-400 text-lg font-bold mb-2">Không tìm thấy bộ sưu tập</p>
        <p className="text-white/30 text-sm mb-8">Bộ sưu tập bạn đang tìm hiện không còn khả dụng.</p>
        <Link
          href="/collections"
          className="text-red-500 text-xs font-bold tracking-wider uppercase hover:text-red-400 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={14} />
          Tất cả bộ sưu tập
        </Link>
      </div>
    )
  }

  const showEmptyState = !collection.pageInfo.hasNextPage && filteredProducts.length === 0

  return (
    <div className="min-h-screen bg-black">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_30%_10%,rgba(220,38,38,0.12),transparent_60%)]" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-8 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-white/40 text-xs font-medium tracking-wider uppercase hover:text-white/70 transition-colors"
          >
            <ArrowLeft size={14} />
            Tất cả bộ sưu tập
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-red-500" />
            <span className="text-red-500 text-xs font-bold tracking-[0.3em] uppercase">
              Bộ sưu tập
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-[var(--font-display)] tracking-tight text-white">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="mt-4 text-sm md:text-base text-white/40 max-w-lg">
              {collection.description}
            </p>
          )}
        </motion.div>

        <div className="lg:hidden mb-6">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase border border-white/[0.1] bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white/70 transition-all"
          >
            <SlidersHorizontal size={14} />
            Bộ lọc
          </button>
        </div>

        <div className="flex gap-8">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block flex-shrink-0 w-[240px]"
          >
            <div className="sticky top-28 bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5">
              <ShoeFilter
                filters={filters}
                onChange={setFilters}
                totalResults={filteredProducts.length}
              />
            </div>
          </motion.aside>

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
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="text-white/40 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
                <ShoeFilter
                  filters={filters}
                  onChange={setFilters}
                  totalResults={filteredProducts.length}
                />
              </motion.div>
            </>
          )}

          <div className="flex-1 min-w-0">
            {!showEmptyState && (
              <InfiniteProductGrid
                products={filteredProducts}
                hasMore={collection.pageInfo.hasNextPage}
                isLoadingMore={isLoadingMore}
                onLoadMore={handleLoadMore}
                resetKey={resetKey}
                delay={0.3}
                itemDuration={0.4}
                className="grid grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
              />
            )}

            {showEmptyState && (
              <div className="text-center py-20 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <p className="text-white/40 text-sm">Không có sản phẩm phù hợp với bộ lọc hiện tại</p>
                <button
                  onClick={() => setFilters(defaultFilters)}
                  className="mt-3 text-red-500 text-xs font-bold tracking-wider uppercase hover:text-red-400 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}

            {loadMoreError && (
              <p className="mt-4 text-center text-xs text-red-400">{loadMoreError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
