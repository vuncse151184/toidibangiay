"use client"

import { useEffect, useRef } from "react"

type UseInfiniteShowMoreOptions = {
  enabled: boolean
  onLoadMore: () => void
  resetKey: string
}

export function useInfiniteShowMore({
  enabled,
  onLoadMore,
  resetKey,
}: UseInfiniteShowMoreOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const hasTriggeredRef = useRef(false)

  useEffect(() => {
    hasTriggeredRef.current = false
  }, [resetKey])

  useEffect(() => {
    if (!enabled || !sentinelRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasTriggeredRef.current) return

        hasTriggeredRef.current = true
        onLoadMore()
      },
      { rootMargin: "240px 0px" }
    )

    observer.observe(sentinelRef.current)

    return () => observer.disconnect()
  }, [enabled, onLoadMore])

  return {
    sentinelRef,
  }
}
