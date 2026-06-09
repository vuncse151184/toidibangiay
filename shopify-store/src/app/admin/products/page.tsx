"use client"

import Image from "next/image"
import { useEffect, useState, useCallback } from "react"
import { Search, Plus, Eye, EyeOff, RefreshCw, Tag } from "lucide-react"
import { backendClientFetch } from "@/lib/backend-client"
import { useAuthStore, type AuthState } from "@/store/auth.store"
import type { AdminProduct, PaginatedMeta } from "@/types/admin"

const formatVND = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

function TableSkeleton() {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-16 bg-white/[0.03] rounded-xl animate-pulse" />
      ))}
    </div>
  )
}

export default function AdminProductsPage() {
  const accessToken = useAuthStore((s: AuthState) => s.accessToken)
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [meta, setMeta] = useState<PaginatedMeta>({ total: 0, page: 1, limit: 20, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (search) params.set("q", search)
      const res = await backendClientFetch<{ data: AdminProduct[]; meta: PaginatedMeta }>(
        `/products?${params}`,
        { accessToken }
      )
      setProducts(res.data)
      setMeta(res.meta)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [page, search, accessToken])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Sản phẩm</h1>
          <p className="text-white/40 text-sm mt-1">{meta.total} sản phẩm</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-colors"
          onClick={() => alert("Tính năng thêm sản phẩm đang phát triển")}
        >
          <Plus size={16} />
          Thêm sản phẩm
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Tìm theo tên, brand..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
          />
        </div>
      </form>

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-white/30 text-sm">Không có sản phẩm nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 tracking-wider uppercase">Sản phẩm</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-white/40 tracking-wider uppercase hidden md:table-cell">Danh mục</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-white/40 tracking-wider uppercase hidden lg:table-cell">Giá thấp nhất</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-white/40 tracking-wider uppercase hidden sm:table-cell">Variants</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-white/40 tracking-wider uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {products.map((product) => {
                  const image = product.images[0]?.url
                  const activeVariants = product.variants.filter((v) => v.isActive)
                  const minPrice = activeVariants.length
                    ? Math.min(...activeVariants.map((v) => v.price))
                    : null

                  return (
                    <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-white/[0.04] overflow-hidden flex-shrink-0">
                            {image ? (
                              <Image src={image} alt={product.name} width={48} height={48} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Tag size={16} className="text-white/20" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium line-clamp-1">{product.name}</p>
                            <p className="text-white/40 text-xs mt-0.5 truncate">{product.brand || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-white/60 text-sm">{product.category?.name || "—"}</span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-white/60 text-sm">{minPrice ? formatVND(minPrice) : "—"}</span>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className="text-white/60 text-sm">{product.variants.length}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${product.isActive ? "bg-green-500/10 text-green-400" : "bg-white/[0.06] text-white/30"}`}>
                          {product.isActive ? <Eye size={10} /> : <EyeOff size={10} />}
                          {product.isActive ? "Hiển thị" : "Ẩn"}
                        </span>
                      </td>
                    </tr>
                  )
                })}
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
        onClick={fetchProducts}
        className="mt-4 flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors"
      >
        <RefreshCw size={12} />
        Làm mới
      </button>
    </div>
  )
}
