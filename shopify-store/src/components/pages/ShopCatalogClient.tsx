"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { SlidersHorizontal, X } from "lucide-react"
import InfiniteProductGrid from "@/components/product/InfiniteProductGrid"
import ShoeFilter, { applyFilters, type ShoeFilters } from "@/components/product/ShoeFilter"
import type { PageInfo, Product, ProductsPage } from "@/types/product"

const defaultFilters: ShoeFilters = {
  priceRange: [0, 500],
  sizes: [],
  availability: "all",
  sortBy: "default",
}

const PRODUCTS_PAGE_SIZE = 20

type ShopCatalogClientProps = {
  initialProducts: Product[]
  initialPageInfo: PageInfo
  hasError?: boolean
}

async function fetchProductsPage(after: string): Promise<ProductsPage> {
  const response = await fetch(
    `/api/products?paginated=1&first=${PRODUCTS_PAGE_SIZE}&after=${encodeURIComponent(after)}`
  )

  if (!response.ok) {
    throw new Error("Failed to fetch more products")
  }

  return response.json()
}

export default function ShopCatalogClient({
  initialProducts,
  initialPageInfo,
  hasError = false,
}: ShopCatalogClientProps) {
  const [filters, setFilters] = useState<ShoeFilters>(defaultFilters)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [products, setProducts] = useState(initialProducts)
  const [pageInfo, setPageInfo] = useState(initialPageInfo)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)

  const filteredProducts = applyFilters(products, filters)
  const resetKey = `${filteredProducts.length}-${pageInfo.endCursor ?? "end"}-${filters.priceRange[0]}-${filters.priceRange[1]}-${filters.availability}-${filters.sortBy}-${[...filters.sizes].sort((a, b) => a - b).join(",")}`

  async function handleLoadMore() {
    if (isLoadingMore || !pageInfo.hasNextPage || !pageInfo.endCursor) return

    setIsLoadingMore(true)
    setLoadMoreError(null)

    try {
      const nextPage = await fetchProductsPage(pageInfo.endCursor)

      setProducts((current) => {
        const currentIds = new Set(current.map((product) => product.id))
        const nextProducts = nextPage.products.filter((product) => !currentIds.has(product.id))
        return [...current, ...nextProducts]
      })
      setPageInfo(nextPage.pageInfo)
    } catch {
      setLoadMoreError("Không thể tải thêm sản phẩm")
    } finally {
      setIsLoadingMore(false)
    }
  }

  const showEmptyState = !pageInfo.hasNextPage && filteredProducts.length === 0

  return (
    <div className="min-h-screen bg-black">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_50%_0%,rgba(220,38,38,0.15),transparent_60%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-8 pt-28 pb-20">
        <div className="mb-14 md:mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-red-500" />
            <span className="text-red-500 text-xs font-bold tracking-[0.3em] uppercase">
              Shop
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-[var(--font-display)] tracking-tight text-white">
            Sneaker chính hãng cho thị trường Việt Nam
          </h1>
          <p className="mt-4 text-sm md:text-base text-white/40 max-w-2xl leading-relaxed">
            Tập hợp những mẫu sneaker, streetwear và phối màu nổi bật đang có tại Toidibangiay.
            Lọc nhanh theo giá, size và tình trạng bán để tìm đúng sản phẩm bạn cần.
          </p>
        </div>

        {!hasError && products.length > 0 && (
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

        {hasError ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-10 text-center">
            <p className="text-red-400 text-sm">Không thể tải danh sách sản phẩm lúc này</p>
            <p className="text-white/30 text-xs mt-1">Vui lòng thử lại sau</p>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-12 text-center">
            <p className="text-white/50">Danh mục đang được cập nhật</p>
          </div>
        ) : (
          <div className="flex gap-8">
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="hidden lg:block flex-shrink-0 w-[260px]"
            >
              <div className="sticky top-28 bg-white/[0.1] border border-white/[0.08] rounded-2xl p-5">
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
                  hasMore={pageInfo.hasNextPage}
                  isLoadingMore={isLoadingMore}
                  onLoadMore={handleLoadMore}
                  resetKey={resetKey}
                  delay={0.2}
                  itemDuration={0.35}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6"
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
        )}
      </div>
    </div>
  )
}
