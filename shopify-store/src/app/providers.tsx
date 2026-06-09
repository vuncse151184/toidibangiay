"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode, useState } from "react"
import { AuthBootstrap } from "@/components/auth/AuthBootstrap"
import { CartBootstrap } from "@/components/cart/CartBootstrap"
import { SmoothScroll } from "@/lib/lenis"

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is fresh for 2 minutes before refetching
        staleTime: 2 * 60 * 1000,
        // Unused cache is garbage-collected after 5 minutes
        gcTime: 5 * 60 * 1000,
        // Don't refetch on window focus (reduces unnecessary API calls)
        refetchOnWindowFocus: false,
        // Only retry once on failure
        retry: 1,
      },
    },
  })
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => makeQueryClient())

  return (
    <QueryClientProvider client={client}>
      <AuthBootstrap />
      <CartBootstrap />
      <SmoothScroll>{children}</SmoothScroll>
    </QueryClientProvider>
  )
}
