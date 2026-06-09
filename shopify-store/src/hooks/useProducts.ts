"use client"

import { useQuery } from "@tanstack/react-query"
import type { Product } from "@/types/product"

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const response = await fetch("/api/products")

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      return response.json()
    },
  })
}
