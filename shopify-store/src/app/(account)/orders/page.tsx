"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, ShoppingBag, Package } from "lucide-react"
import { useAuthStore, type AuthState } from "@/store/auth.store"
import { backendClientFetch } from "@/lib/backend-client"
import type { AdminOrder, OrderStatus } from "@/types/admin"

interface PaginatedMeta { total: number; page: number; limit: number; totalPages: number }

const STATUS_CONFIG: Record<OrderStatus, { label: string; dot: string; badge: string }> = {
  PENDING:    { label: "Chờ xác nhận", dot: "bg-amber-400",  badge: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  CONFIRMED:  { label: "Đã xác nhận",  dot: "bg-blue-400",   badge: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  PROCESSING: { label: "Đang xử lý",   dot: "bg-indigo-400", badge: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20" },
  SHIPPED:    { label: "Đang giao",    dot: "bg-cyan-400",   badge: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
  DELIVERED:  { label: "Đã nhận hàng", dot: "bg-green-400",  badge: "text-green-400 bg-green-400/10 border-green-400/20" },
  CANCELLED:  { label: "Đã huỷ",       dot: "bg-white/20",   badge: "text-white/30 bg-white/[0.05] border-white/10" },
}

const PAYMENT_LABEL: Record<string, string> = { COD: "COD", VNPAY: "VNPay", MOMO: "MoMo" }
const TABS: Array<OrderStatus | "ALL"> = ["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]

function formatVND(n: number) { return new Intl.NumberFormat("vi-VN").format(n) + "₫" }
function formatDate(s: string) {
  return new Date(s).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export default function OrdersPage() {
  const router      = useRouter()
  const accessToken = useAuthStore((s: AuthState) => s.accessToken)
  const initialized = useAuthStore((s: AuthState) => s.initialized)

  const [orders,       setOrders]       = useState<AdminOrder[]>([])
  const [meta,         setMeta]         = useState<PaginatedMeta | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [page,         setPage]         = useState(1)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL")

  useEffect(() => {
    if (initialized && !accessToken) router.replace("/login?from=/orders")
  }, [initialized, accessToken, router])

  const fetchOrders = useCallback(async () => {
    if (!accessToken) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" })
      if (statusFilter !== "ALL") params.set("status", statusFilter)
      const res = await backendClientFetch<{ data: AdminOrder[]; meta: PaginatedMeta }>(
        `/orders?${params}`,
        { accessToken },
      )
      setOrders(res.data)
      setMeta(res.meta)
    } catch {
      setOrders([])
      setMeta(null)
    } finally {
      setLoading(false)
    }
  }, [accessToken, page, statusFilter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  if (!initialized || (initialized && !accessToken)) return null

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold tracking-tight">Đơn hàng của tôi</h1>
            <Link href="/" className="text-xs text-white/30 hover:text-white/60 tracking-widest uppercase transition-colors">
              ← Tiếp tục mua
            </Link>
          </div>
          {meta && <p className="text-white/40 text-sm">{meta.total} đơn hàng</p>}
        </div>

        {/* Status tabs */}
        <div className="flex gap-1.5 flex-wrap mb-6 pb-6 border-b border-white/[0.07]">
          {TABS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide transition-all ${
                statusFilter === s
                  ? "bg-red-600 text-white"
                  : "bg-white/[0.05] text-white/40 hover:text-white hover:bg-white/[0.09]"
              }`}
            >
              {s === "ALL" ? "Tất cả" : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl bg-white/[0.04] animate-pulse" style={{ height: 160 }} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center">
              <ShoppingBag size={28} className="text-white/20" />
            </div>
            <p className="text-white/30 text-sm">Chưa có đơn hàng nào</p>
            <Link href="/" className="mt-1 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition-colors">
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const st = STATUS_CONFIG[order.status]
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="group block rounded-2xl overflow-hidden transition-all hover:ring-1 hover:ring-white/10"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  {/* Order header */}
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`} />
                      <span className="text-xs font-bold tracking-wider">{order.orderCode}</span>
                      <span className="text-white/20 text-xs hidden sm:inline">·</span>
                      <span className="text-xs text-white/40 hidden sm:inline">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${st.badge}`}>
                        {st.label}
                      </span>
                      <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 transition-colors" />
                    </div>
                  </div>

                  {/* Items table */}
                  <div className="divide-y divide-white/[0.04]">
                    {order.items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-5 py-3"
                        style={{ background: idx % 2 === 1 ? "rgba(255,255,255,0.01)" : "transparent" }}
                      >
                        {/* Image or icon */}
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0 border border-white/[0.06]">
                          {item.imageUrl ? (
                            <Image src={item.imageUrl} alt={item.productName} width={40} height={40} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={14} className="text-white/20" />
                            </div>
                          )}
                        </div>

                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{item.productName}</p>
                          <p className="text-[11px] text-white/40 mt-0.5">{item.variantTitle}</p>
                        </div>

                        {/* Qty + price */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-white/50">x{item.quantity}</p>
                          <p className="text-sm font-semibold text-white">{formatVND(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer: date (mobile) + payment + total */}
                  <div
                    className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06] gap-3"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/30">{formatDate(order.createdAt)}</span>
                      <span className="text-white/20 text-xs">·</span>
                      <span className="text-xs text-white/30">{PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-white/40 mr-2">Tổng</span>
                      <span className="text-sm font-bold text-red-400">{formatVND(order.total)}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1}
              className="px-4 py-2 text-sm rounded-xl bg-white/[0.06] text-white/60 disabled:opacity-30 hover:bg-white/[0.1] transition-colors">
              ← Trước
            </button>
            <span className="text-sm text-white/40">{page} / {meta.totalPages}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={page >= meta.totalPages}
              className="px-4 py-2 text-sm rounded-xl bg-white/[0.06] text-white/60 disabled:opacity-30 hover:bg-white/[0.1] transition-colors">
              Sau →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
