"use client"

import { motion } from "framer-motion"
import { ShoppingBag, Loader2 } from "lucide-react"
import { useState } from "react"
import { useAuthStore, type AuthState } from "@/store/auth.store"
import { useCartStore, type CartState, type OptimisticItem } from "@/store/cart.store"

type Props = {
  variantId: string
  disabled?: boolean
  optimistic?: OptimisticItem
}

export default function AddToCartButton({ variantId, disabled, optimistic }: Props) {
  const addItem = useCartStore((s: CartState) => s.addItem)
  const accessToken = useAuthStore((s: AuthState) => s.accessToken)
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  const handleClick = async () => {
    if (!variantId || disabled) return

    setLoading(true)
    try {
      await addItem(variantId, 1, accessToken, optimistic)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-3 w-full py-4 rounded-lg text-sm font-bold tracking-[0.15em] uppercase transition-all duration-300 ${
        disabled
          ? "bg-white/[0.06] text-white/20 cursor-not-allowed"
          : added
          ? "bg-green-600 text-white shadow-lg shadow-green-600/20"
          : "bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/20"
      }`}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : added ? (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Đã thêm vào giỏ
        </>
      ) : (
        <>
          <ShoppingBag size={18} />
          Thêm vào giỏ
        </>
      )}
    </motion.button>
  )
}
