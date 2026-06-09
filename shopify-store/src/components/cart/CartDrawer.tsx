"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { X, Minus, Plus, ShoppingBag } from "lucide-react"
import { useAuthStore, type AuthState } from "@/store/auth.store"
import { useCartStore, selectTotalItems, selectSubtotal, type CartItem, type CartState } from "@/store/cart.store"

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫'
}

export default function CartDrawer({
  open,
  onClose
}: {
  open: boolean
  onClose: () => void
}) {
  const items: CartItem[] = useCartStore((s: CartState) => s.items)
  const removeItem = useCartStore((s: CartState) => s.removeItem)
  const updateQuantity = useCartStore((s: CartState) => s.updateQuantity)
  const accessToken = useAuthStore((s: AuthState) => s.accessToken)
  const totalItems = useCartStore(selectTotalItems)
  const subtotal = useCartStore(selectSubtotal)

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-neutral-950 border-l border-white/[0.08] shadow-2xl z-[61] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-red-500" />
                <h2 className="text-lg font-bold font-[var(--font-display)] tracking-wider uppercase text-white">
                  Giỏ Hàng
                </h2>
                {totalItems > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-white/50 hover:text-white transition-colors"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={48} className="text-white/10 mb-4" />
                  <p className="text-white/40 text-sm">Giỏ hàng trống</p>
                  <Link
                    href="/"
                    onClick={onClose}
                    className="mt-4 text-red-500 text-xs font-bold tracking-wider uppercase hover:text-red-400 transition-colors"
                  >
                    Tiếp tục mua sắm
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.variantId}
                      className="flex gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                    >
                      {/* Image */}
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/10">
                            <ShoppingBag size={20} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white/90 truncate">
                          {item.title}
                        </h3>
                        <p className="text-red-500 text-sm font-bold font-[var(--font-display)] mt-1">
                          {formatVND(item.price)}
                        </p>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1, accessToken)}
                            className="w-7 h-7 rounded-md bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-white hover:border-red-500/30 transition-colors duration-200"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm text-white/80 w-6 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1, accessToken)}
                            className="w-7 h-7 rounded-md bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-white hover:border-red-500/30 transition-colors duration-200"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.variantId, accessToken)}
                        className="text-white/30 hover:text-red-500 transition-colors self-start mt-1"
                        aria-label="Remove item"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/[0.08] px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50 uppercase tracking-wider">Tạm tính</span>
                  <span className="text-lg font-bold text-white font-[var(--font-display)]">
                    {formatVND(subtotal)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-red-600 hover:bg-red-500 text-white text-sm font-bold tracking-[0.15em] uppercase rounded-xl transition-colors duration-300 shadow-lg shadow-red-600/20"
                >
                  Thanh toán
                </Link>

                <button
                  onClick={onClose}
                  className="block w-full py-3 text-center text-xs text-white/40 tracking-wider uppercase hover:text-white/60 transition-colors"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
