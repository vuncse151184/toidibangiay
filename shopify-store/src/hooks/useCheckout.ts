"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { backendClientFetch } from "@/lib/backend-client"
import { useAuthStore, type AuthState } from "@/store/auth.store"
import { useCartStore, type CartItem, type CartState } from "@/store/cart.store"

export function useCheckout() {
  const items: CartItem[] = useCartStore((s: CartState) => s.items)
  const accessToken = useAuthStore((s: AuthState) => s.accessToken)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkout = async () => {
    if (!items.length) return
    if (!accessToken) { 
      router.push("/login?from=/checkout")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { checkoutUrl } = await backendClientFetch<{ checkoutUrl: string }>("/checkout", {
        method: "POST",
        accessToken,
      })

      window.location.href = checkoutUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setLoading(false)
    }
  }

  return { checkout, loading, error }
}
