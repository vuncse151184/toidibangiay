"use client"

import { useQuery } from "@tanstack/react-query"
import type { Collection, CollectionPage } from "@/types/collection"

export function useCollections() {
  return useQuery({
    queryKey: ["collections"],
    queryFn: async (): Promise<Collection[]> => {
      const response = await fetch("/api/collections")
      if (!response.ok) throw new Error("Failed to fetch collections")
      return response.json()
    },
  })
}

export function useCollection(handle: string) {
  return useQuery({
    queryKey: ["collection", handle],
    queryFn: async (): Promise<CollectionPage> => {
      const response = await fetch(`/api/collections/${handle}`)
      if (!response.ok) throw new Error("Failed to fetch collection")
      return response.json()
    },
    enabled: !!handle,
  })
}
