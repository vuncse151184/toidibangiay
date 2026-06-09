"use client"

import { useEffect, useState, useCallback } from "react"
import { RefreshCw, Plus, AlertTriangle } from "lucide-react"
import { backendClientFetch } from "@/lib/backend-client"
import { useAuthStore, type AuthState } from "@/store/auth.store"
import type { InventoryItem } from "@/types/admin"

function TableSkeleton() {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-12 bg-white/[0.03] rounded-xl animate-pulse" />
      ))}
    </div>
  )
}

function RestockModal({
  variantId,
  onClose,
  onSuccess,
  accessToken,
}: {
  variantId: string
  onClose: () => void
  onSuccess: () => void
  accessToken: string | null
}) {
  const [qty, setQty] = useState("10")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const quantity = parseInt(qty)
    if (!quantity || quantity <= 0) return
    setLoading(true)
    setError("")
    try {
      await backendClientFetch("/inventory/restock", {
        accessToken,
        method: "POST",
        body: JSON.stringify({ variantId, quantity }),
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nhập hàng thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-white/[0.1] rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-white font-semibold mb-1">Nhập hàng</h3>
        <p className="text-white/40 text-xs mb-4 truncate font-mono">{variantId}</p>
        {error && <p className="mb-4 text-red-400 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/50 font-medium mb-1.5 block">Số lượng nhập</label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              min="1"
              className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm focus:outline-none focus:border-white/30"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm text-white/50 border border-white/[0.1] rounded-xl hover:border-white/20 hover:text-white transition-all"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminInventoryPage() {
  const accessToken = useAuthStore((s: AuthState) => s.accessToken)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [restockVariantId, setRestockVariantId] = useState<string | null>(null)

  const fetchInventory = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      const res = await backendClientFetch<{ data: InventoryItem[] }>(
        `/inventory/admin/all?${params}`,
        { accessToken }
      )
      setItems(res.data)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [page, accessToken])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  const lowStockItems = items.filter((i) => i.available < 5)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Tồn kho</h1>
          <p className="text-white/40 text-sm mt-1">{items.length} variants</p>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStockItems.length > 0 && (
        <div className="mb-6 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 text-sm font-semibold">
              {lowStockItems.length} variant sắp hết hàng (available &lt; 5)
            </p>
            <p className="text-red-400/60 text-xs mt-0.5">Cần nhập thêm hàng</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : items.length === 0 ? (
          <div className="py-20 text-center text-white/30 text-sm">Không có dữ liệu tồn kho</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 tracking-wider uppercase">Variant ID</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-white/40 tracking-wider uppercase">Tổng kho</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-white/40 tracking-wider uppercase">Đã đặt</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-white/40 tracking-wider uppercase">Còn lại</th>
                  <th className="px-4 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {items.map((item) => {
                  const isLow = item.available < 5
                  return (
                    <tr
                      key={item.variantId}
                      className={`hover:bg-white/[0.02] transition-colors ${isLow ? "bg-red-500/[0.03]" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <p className="text-white/70 text-xs font-mono truncate max-w-[200px]">{item.variantId}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-white/70 text-sm">{item.quantity}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-white/50 text-sm">{item.reserved}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-sm font-semibold ${isLow ? "text-red-400" : item.available < 10 ? "text-yellow-400" : "text-green-400"}`}>
                          {item.available}
                          {isLow && <AlertTriangle size={12} className="inline ml-1" />}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => setRestockVariantId(item.variantId)}
                          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white border border-white/[0.08] hover:border-white/20 px-3 py-1.5 rounded-lg transition-all"
                        >
                          <Plus size={12} />
                          Nhập hàng
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <button
        onClick={fetchInventory}
        className="mt-4 flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors"
      >
        <RefreshCw size={12} />
        Làm mới
      </button>

      {restockVariantId && (
        <RestockModal
          variantId={restockVariantId}
          accessToken={accessToken}
          onClose={() => setRestockVariantId(null)}
          onSuccess={fetchInventory}
        />
      )}
    </div>
  )
}
