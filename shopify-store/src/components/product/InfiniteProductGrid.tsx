"use client"

import { motion } from "framer-motion"
import { useInfiniteShowMore } from "@/hooks/useInfiniteShowMore"
import type { Product } from "@/types/product"
import ProductCard from "./ProductCard"

type InfiniteProductGridProps = {
  products: Product[]
  className: string
  delay?: number
  itemDuration?: number
  hasMore?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
  resetKey?: string
}

export default function InfiniteProductGrid({
  products,
  className,
  delay = 0,
  itemDuration = 0.35,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  resetKey = "",
}: InfiniteProductGridProps) {
  const { sentinelRef } = useInfiniteShowMore({
    enabled: hasMore && !isLoadingMore && Boolean(onLoadMore),
    onLoadMore: onLoadMore ?? (() => undefined),
    resetKey,
  })

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay }}
        className={className}
      >
        {products.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: itemDuration }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>

      {(hasMore || isLoadingMore) && (
        <div ref={sentinelRef} className="flex items-center justify-center py-4">
          <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/30">
            {isLoadingMore ? "Đang tải thêm" : "Cuộn để tải thêm"}
          </span>
        </div>
      )}
    </div>
  )
}
