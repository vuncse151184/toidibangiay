"use client"

import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import { RefreshCw, ChevronRight, Download } from "lucide-react"
import { backendClientFetch } from "@/lib/backend-client"
import { useAuthStore, type AuthState } from "@/store/auth.store"
import type { AdminOrder, OrderStatus, PaginatedMeta } from "@/types/admin"

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
  PENDING: "bg-yellow-500/10 text-yellow-400",
  CONFIRMED: "bg-blue-500/10 text-blue-400",
  PROCESSING: "bg-purple-500/10 text-purple-400",
  SHIPPED: "bg-cyan-500/10 text-cyan-400",
  DELIVERED: "bg-green-500/10 text-green-400",
  CANCELLED: "bg-red-500/10 text-red-400",
}

const PAYMENT_LABELS = { VNPAY: "VNPay", MOMO: "MoMo", COD: "COD" }

const ALL_STATUSES: Array<OrderStatus | ""> = [
  "", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED",
]

function exportCSV(orders: AdminOrder[]) {
  const header = ["Mã đơn", "Khách hàng", "Điện thoại", "Tổng tiền", "Thanh toán", "Trạng thái", "Ngày đặt"]
  const rows = orders.map((o) => [
    o.orderCode,
    o.shippingAddress.fullName,
    o.shippingAddress.phone,
    o.total,
    PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod,
    STATUS_LABELS[o.status],
    new Date(o.createdAt).toLocaleString("vi-VN"),
  ])
  const csv = [header, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n")
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-16 bg-white/[0.03] rounded-xl animate-pulse" />
      ))}
    </div>
  )
}

export default function AdminOrdersPage() {
  const accessToken = useAuthStore((s: AuthState) => s.accessToken)
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [meta, setMeta] = useState<PaginatedMeta>({ total: 0, page: 1, limit: 20, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("")
  const [page, setPage] = useState(1)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      const res = await backendClientFetch<{ data: AdminOrder[]; meta: PaginatedMeta }>(
        `/orders/admin/all?${params}`,
        { accessToken }
      )
      const filtered = statusFilter
        ? res.data.filter((o) => o.status === statusFilter)
        : res.data
      setOrders(filtered)
      setMeta(res.meta)
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, accessToken])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Đơn hàng</h1>
          <p className="text-white/40 text-sm mt-1">{meta.total} đơn hàng</p>
        </div>
        <button
          onClick={() => exportCSV(orders)}
          disabled={orders.length === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 border border-white/[0.08] rounded-xl hover:border-white/20 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Download size={14} />
          Xuất CSV
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {ALL_STATUSES.map((s) => (
          <button
            key={s || "all"}
            onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === s
                ? "bg-red-600 text-white"
                : "bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]"
            }`}
          >
            {s ? STATUS_LABELS[s] : "Tất cả"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-white/30 text-sm">Không có đơn hàng nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 tracking-wider uppercase">Mã đơn</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-white/40 tracking-wider uppercase hidden md:table-cell">Khách hàng</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-white/40 tracking-wider uppercase">Tổng tiền</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-white/40 tracking-wider uppercase hidden sm:table-cell">Thanh toán</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-white/40 tracking-wider uppercase">Trạng thái</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-white/40 tracking-wider uppercase hidden lg:table-cell">Ngày đặt</th>
                  <th className="px-4 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-white text-sm font-mono font-medium">{order.orderCode}</p>
                      <p className="text-white/30 text-xs mt-0.5">{order.items.length} sản phẩm</p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-white/70 text-sm">
                        {(order.shippingAddress as { fullName?: string })?.fullName || "—"}
                      </p>
                      <p className="text-white/30 text-xs">
                        {(order.shippingAddress as { phone?: string })?.phone || ""}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-white text-sm font-semibold">{formatVND(order.total)}</span>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className="text-white/60 text-xs font-medium bg-white/[0.06] px-2 py-1 rounded-md">
                        {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-white/40 text-xs">{formatDate(order.createdAt)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors"
                      >
                        Chi tiết <ChevronRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-white/30 text-sm">Trang {meta.page} / {meta.totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 text-sm text-white/60 border border-white/[0.08] rounded-xl hover:border-white/20 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Trước
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
              className="px-4 py-2 text-sm text-white/60 border border-white/[0.08] rounded-xl hover:border-white/20 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Tiếp
            </button>
          </div>
        </div>
      )}

      <button
        onClick={fetchOrders}
        className="mt-4 flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors"
      >
        <RefreshCw size={12} />
        Làm mới
      </button>
    </div>
  )
}
