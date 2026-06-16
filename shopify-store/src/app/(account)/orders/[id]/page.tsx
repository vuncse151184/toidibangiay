"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, MapPin, Package, CreditCard, AlertCircle, ShoppingBag } from "lucide-react"
import { useAuthStore, type AuthState } from "@/store/auth.store"
import { backendClientFetch } from "@/lib/backend-client"
import type { AdminOrder, OrderStatus } from "@/types/admin"

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; step: number }> = {
  PENDING:    { label: "Chờ xác nhận", color: "text-amber-400 bg-amber-400/10 border-amber-400/20",    step: 1 },
  CONFIRMED:  { label: "Đã xác nhận",  color: "text-blue-400 bg-blue-400/10 border-blue-400/20",       step: 2 },
  PROCESSING: { label: "Đang xử lý",   color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20", step: 3 },
  SHIPPED:    { label: "Đang giao",    color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",        step: 4 },
  DELIVERED:  { label: "Đã nhận hàng", color: "text-green-400 bg-green-400/10 border-green-400/20",    step: 5 },
  CANCELLED:  { label: "Đã huỷ",       color: "text-white/30 bg-white/[0.05] border-white/10",         step: 0 },
}

const PAYMENT_LABEL: Record<string, string> = { COD: "Thanh toán khi nhận hàng", VNPAY: "VNPay", MOMO: "MoMo" }
const STEPS: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"]

function formatVND(n: number) { return new Intl.NumberFormat("vi-VN").format(n) + "₫" }
function formatDateTime(s: string) {
  return new Date(s).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function OrderDetailPage() {
  const router      = useRouter()
  const { id }      = useParams<{ id: string }>()
  const accessToken = useAuthStore((s: AuthState) => s.accessToken)
  const initialized = useAuthStore((s: AuthState) => s.initialized)

  const [order,      setOrder]      = useState<AdminOrder | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [error,      setError]      = useState("")

  useEffect(() => {
    if (initialized && !accessToken) router.replace("/login?from=/orders")
  }, [initialized, accessToken, router])

  useEffect(() => {
    if (!accessToken || !id) return
    setLoading(true)
    backendClientFetch<{ data: AdminOrder }>(`/orders/${id}`, { accessToken })
      .then((res) => setOrder(res.data))
      .catch(() => setError("Không tìm thấy đơn hàng"))
      .finally(() => setLoading(false))
  }, [accessToken, id])

  async function handleCancel() {
    if (!accessToken || !order) return
    setCancelling(true)
    try {
      await backendClientFetch(`/orders/${order.id}/cancel`, { method: "PUT", accessToken })
      setOrder((prev) => prev ? { ...prev, status: "CANCELLED" } : prev)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Huỷ đơn thất bại")
    } finally {
      setCancelling(false)
    }
  }

  if (!initialized || (initialized && !accessToken)) return null

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
    </div>
  )

  if (error && !order) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
      <p className="text-white/50">{error}</p>
      <Link href="/orders" className="text-red-400 text-sm hover:text-red-300">← Về danh sách đơn hàng</Link>
    </div>
  )

  if (!order) return null

  const st = STATUS_CONFIG[order.status]
  const addr = order.shippingAddress
  const canCancel = order.status === "PENDING" || order.status === "CONFIRMED"

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-10">

        <Link href="/orders" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={15} /> Đơn hàng của tôi
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-wide">{order.orderCode}</h1>
            <p className="text-white/40 text-xs mt-1">{formatDateTime(order.createdAt)}</p>
          </div>
          <span className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border flex-shrink-0 ${st.color}`}>
            {st.label}
          </span>
        </div>

        {/* Progress stepper */}
        {order.status !== "CANCELLED" && (
          <div className="mb-6 p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-3 h-px bg-white/10" />
              <div
                className="absolute left-0 top-3 h-px bg-red-500 transition-all duration-700"
                style={{ width: `${((st.step - 1) / (STEPS.length - 1)) * 100}%` }}
              />
              {STEPS.map((s, i) => {
                const done = STATUS_CONFIG[s].step <= st.step
                return (
                  <div key={s} className="relative flex flex-col items-center gap-1.5 z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      done ? "bg-red-600 text-white" : "bg-neutral-800 text-white/20 border border-white/10"
                    }`}>{done ? "✓" : i + 1}</div>
                    <span className={`text-[9px] text-center leading-tight hidden sm:block ${done ? "text-white/60" : "text-white/20"}`}>
                      {STATUS_CONFIG[s].label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="mb-4 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06]" style={{ background: "rgba(255,255,255,0.03)" }}>
            <Package size={13} className="text-white/40" />
            <span className="text-xs font-semibold tracking-widest uppercase text-white/50">Sản phẩm</span>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-900 flex-shrink-0">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.productName} width={56} height={56} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag size={18} className="text-white/20" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.productName}</p>
                  <p className="text-xs text-white/40 mt-0.5">{item.variantTitle}</p>
                  <p className="text-xs text-white/30 mt-0.5">x{item.quantity} · {formatVND(item.price)}/đôi</p>
                </div>
                <p className="text-sm font-bold flex-shrink-0">{formatVND(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="mb-4 rounded-2xl p-5 space-y-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex justify-between text-sm text-white/60"><span>Tạm tính</span><span>{formatVND(order.subtotal)}</span></div>
          <div className="flex justify-between text-sm text-white/60"><span>Phí vận chuyển</span><span>{formatVND(order.shippingFee)}</span></div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm text-green-400"><span>Giảm giá</span><span>-{formatVND(order.discount)}</span></div>
          )}
          <div className="flex justify-between text-base font-bold pt-2 border-t border-white/[0.08]">
            <span>Tổng cộng</span><span className="text-red-400">{formatVND(order.total)}</span>
          </div>
        </div>

        {/* Shipping + Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={13} className="text-white/40" />
              <span className="text-xs font-semibold tracking-widest uppercase text-white/50">Giao hàng</span>
            </div>
            <p className="text-sm font-medium">{addr.fullName}</p>
            <p className="text-xs text-white/50 mt-1">{addr.phone}</p>
            <p className="text-xs text-white/50 mt-1 leading-relaxed">
              {[addr.address, addr.district, addr.city ?? addr.province].filter(Boolean).join(", ")}
            </p>
          </div>
          <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={13} className="text-white/40" />
              <span className="text-xs font-semibold tracking-widest uppercase text-white/50">Thanh toán</span>
            </div>
            <p className="text-sm font-medium">{PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}</p>
            {order.note && <p className="text-xs text-white/40 mt-2 italic">"{order.note}"</p>}
          </div>
        </div>

        {/* Timeline */}
        {order.events.length > 0 && (
          <div className="mb-6 rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs font-semibold tracking-widest uppercase text-white/50 mb-4">Lịch sử trạng thái</p>
            <div className="space-y-3">
              {[...order.events].reverse().map((ev) => {
                const evSt = STATUS_CONFIG[ev.status]
                return (
                  <div key={ev.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${evSt.color.split(" ").find(c => c.startsWith("bg-"))}`} />
                    <div>
                      <p className="text-xs font-medium">{evSt.label}</p>
                      <p className="text-[11px] text-white/40">{formatDateTime(ev.createdAt)}</p>
                      {ev.note && <p className="text-[11px] text-white/50 mt-0.5">{ev.note}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex gap-2 items-center bg-red-500/[0.08] border border-red-500/20 rounded-xl px-4 py-3 mb-4">
            <AlertCircle size={13} className="text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* Cancel */}
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {cancelling ? "Đang huỷ..." : "Huỷ đơn hàng"}
          </button>
        )}
      </div>
    </div>
  )
}
