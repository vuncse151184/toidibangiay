"use client"

import { useEffect } from "react"
import { useAuthStore, type AuthState } from "@/store/auth.store"
import { useCartStore, type CartState } from "@/store/cart.store"

export function CartBootstrap() {
  const accessToken = useAuthStore((state: AuthState) => state.accessToken)
  const initialized = useAuthStore((state: AuthState) => state.initialized)
  const syncCart = useCartStore((state: CartState) => state.syncCart)

  useEffect(() => {
    if (!initialized) return
    // Sync for both auth users and guests (x-session-id sent automatically via backendClientFetch)
    syncCart(accessToken).catch(() => undefined)
  }, [accessToken, initialized, syncCart])

  return null
}
