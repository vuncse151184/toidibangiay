"use client"

import Link from "next/link"
import { use, useEffect, useState } from "react"
import { ArrowLeft, CheckCircle, XCircle, Truck, Package } from "lucide-react"
import { backendClientFetch } from "@/lib/backend-client"
import { useAuthStore, type AuthState } from "@/store/auth.store"
import type { AdminOrder, OrderStatus } from "@/types/admin"

const formatVND = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(date))

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã huỷ",
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  CONFIRMED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PROCESSING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  SHIPPED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  DELIVERED: "bg-green-500/10 text-green-400 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
}

type ActionDef = { label: string; nextStatus: OrderStatus; icon: React.ElementType; color: string }
const NEXT_ACTIONS: Partial<Record<OrderStatus, ActionDef[]>> = {
  PENDING: [
    { label: "Xác nhận đơn", nextStatus: "CONFIRMED", icon: CheckCircle, color: "bg-blue-600 hover:bg-blue-500" },
    { label: "Huỷ đơn", nextStatus: "CANCELLED", icon: XCircle, color: "bg-red-600 hover:bg-red-500" },
  ],
  CONFIRMED: [
    { label: "Bắt đầu xử lý", nextStatus: "PROCESSING", icon: Package, color: "bg-purple-600 hover:bg-purple-500" },
    { label: "Huỷ đơn", nextStatus: "CANCELLED", icon: XCircle, color: "bg-red-600 hover:bg-red-500" },
  ],
  PROCESSING: [
    { label: "Giao cho vận chuyển", nextStatus: "SHIPPED", icon: Truck, color: "bg-cyan-600 hover:bg-cyan-500" },
  ],
  SHIPPED: [
    { label: "Đã giao thành công", nextStatus: "DELIVERED", icon: CheckCircle, color: "bg-green-600 hover:bg-green-500" },
  ],
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const accessToken = useAuthStore((s: AuthState) => s.accessToken)
  const [order, setOrder] = useState<AdminOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setLoading(true)
    backendClientFetch<AdminOrder>(`/orders/${id}`, { accessToken })
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [id, accessToken])

  const updateStatus = async (nextStatus: OrderStatus) => {
    if (!order) return
    setUpdating(true)
    setError("")
    try {
      const updated = await backendClientFetch<AdminOrder>(`/orders/${id}/status`, {
        accessToken,
        method: "PUT",
        body: JSON.stringify({ status: nextStatus }),
      })
      setOrder(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cập nhật thất bại")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-white/[0.03] rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-white/40">Không tìm thấy đơn hàng</p>
        <Link href="/admin/orders" className="mt-4 inline-block text-sm text-red-400 hover:text-red-300">
          ← Quay lại
        </Link>
      </div>
    )
  }

  const addr = order.shippingAddress as { fullName?: string; phone?: string; address?: string; province?: string }
  const actions = NEXT_ACTIONS[order.status] ?? []

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/orders" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white font-mono">{order.orderCode}</h1>
          <p className="text-white/40 text-sm mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <span className={`ml-auto inline-block px-3 py-1.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order items */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-sm font-semibold text-white">Sản phẩm đặt hàng</h2>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {order.items.map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{item.productName}</p>
                    <p className="text-white/40 text-xs mt-0.5">{item.variantTitle} × {item.quantity}</p>
                  </div>
                  <span className="text-white/70 text-sm font-semibold">{formatVND(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-white/[0.06] space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Tạm tính</span>
                <span className="text-white/70">{formatVND(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Phí vận chuyển</span>
                <span className="text-white/70">{formatVND(order.shippingFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Giảm giá</span>
                  <span className="text-green-400">-{formatVND(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-2 border-t border-white/[0.06]">
                <span className="text-white">Tổng cộng</span>
                <span className="text-white">{formatVND(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          {order.events && order.events.length > 0 && (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-white mb-4">Lịch sử trạng thái</h2>
              <div className="space-y-3">
                {order.events.map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm">{STATUS_LABELS[event.status]}</p>
                      {event.note && <p className="text-white/40 text-xs mt-0.5">{event.note}</p>}
                      <p className="text-white/30 text-xs mt-0.5">{formatDate(event.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Shipping */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Thông tin giao hàng</h2>
            <div className="space-y-2 text-sm">
              <p className="text-white font-medium">{addr?.fullName || "—"}</p>
              <p className="text-white/50">{addr?.phone || "—"}</p>
              <p className="text-white/50">{addr?.address || "—"}</p>
              {addr?.province && <p className="text-white/50">{addr.province}</p>}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-3">Thanh toán</h2>
            <span className="text-white/60 text-sm font-medium bg-white/[0.06] px-2.5 py-1.5 rounded-lg">
              {order.paymentMethod}
            </span>
          </div>

          {/* Actions */}
          {actions.length > 0 && (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-white mb-4">Thao tác</h2>
              <div className="space-y-2">
                {actions.map((action) => (
                  <button
                    key={action.nextStatus}
                    onClick={() => updateStatus(action.nextStatus)}
                    disabled={updating}
                    className={`flex items-center gap-2 w-full px-4 py-2.5 ${action.color} text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50`}
                  >
                    <action.icon size={16} />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
