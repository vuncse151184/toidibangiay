"use client"

import { useQuery } from "@tanstack/react-query"
import type { Product } from "@/types/product"

export function useProduct(handle: string) {
  return useQuery({
    queryKey: ["product", handle],
    queryFn: async (): Promise<Product> => {
      const response = await fetch(`/api/products/${handle}`)

      if (!response.ok) {
        throw new Error("Failed to fetch product")
      }

      return response.json()
    },
    enabled: !!handle,
  })
}
