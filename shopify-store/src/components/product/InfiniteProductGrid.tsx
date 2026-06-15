"use client"

import { useRef, useEffect, useState } from "react"
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

  const prevResetKeyRef = useRef(resetKey)
  const prevCountRef = useRef(0)
  const [animateFrom, setAnimateFrom] = useState(0)

  useEffect(() => {
    const isReset = resetKey !== prevResetKeyRef.current
    if (isReset) {
      setAnimateFrom(0)
      prevResetKeyRef.current = resetKey
    } else if (products.length > prevCountRef.current) {
      setAnimateFrom(prevCountRef.current)
    }
    prevCountRef.current = products.length
  }, [products.length, resetKey])

  return (
    <div className="space-y-6">
      <div className={className}>
        {products.map((product, i) => {
          const isNew = i >= animateFrom
          return (
            <div
              key={product.id}
              style={
                isNew
                  ? { animation: `fade-in-up 0.4s ease-out ${Math.min((i - animateFrom) * 35, 400)}ms both` }
                  : undefined
              }
            >
              <ProductCard product={product} />
            </div>
          )
        })}
      </div>

      {(hasMore || isLoadingMore) && (
        <div ref={sentinelRef} className="flex items-center justify-center py-6">
          {isLoadingMore ? (
            <div className="flex items-center gap-2.5">
              <span className="w-1 h-1 rounded-full bg-red-500/60 animate-bounce [animation-delay:0ms]" />
              <span className="w-1 h-1 rounded-full bg-red-500/60 animate-bounce [animation-delay:150ms]" />
              <span className="w-1 h-1 rounded-full bg-red-500/60 animate-bounce [animation-delay:300ms]" />
            </div>
          ) : (
            <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/20">
              Cuộn để tải thêm
            </span>
          )}
        </div>
      )}
    </div>
  )
}
