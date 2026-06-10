"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react"
import ImageUpload from "@/components/ui/ImageUpload"
import { backendClientFetch } from "@/lib/backend-client"
import { useAuthStore, type AuthState } from "@/store/auth.store"
import type { AdminProduct } from "@/types/admin"

type VariantRow = {
  tempId: string
  id?: string
  sku: string
  size: string
  color: string
  price: string
  compareAtPrice: string
  isActive: boolean
  image: string
}

const newVariant = (): VariantRow => ({
  tempId: Math.random().toString(36).slice(2),
  sku: "", size: "", color: "", price: "", compareAtPrice: "", isActive: true, image: "",
})

const inputCls = "w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
const smallInputCls = "w-full px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${value ? "bg-green-500" : "bg-white/[0.12]"}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${value ? "left-5" : "left-1"}`} />
    </button>
  )
}

export default function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const accessToken = useAuthStore((s: AuthState) => s.accessToken)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  const [name, setName] = useState("")
  const [brand, setBrand] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [variants, setVariants] = useState<VariantRow[]>([newVariant()])

  useEffect(() => {
    backendClientFetch<AdminProduct>(`/products/${id}`, { accessToken })
      .then((p) => {
        setName(p.name)
        setBrand(p.brand ?? "")
        setDescription(p.description ?? "")
        setIsActive(p.isActive)
        setVariants(
          p.variants.length
            ? p.variants.map((v) => ({
                tempId: v.id,
                id: v.id,
                sku: v.sku,
                size: v.size ?? "",
                color: v.color ?? "",
                price: String(v.price),
                compareAtPrice: v.compareAtPrice ? String(v.compareAtPrice) : "",
                isActive: v.isActive,
                image: v.image ?? "",
              }))
            : [newVariant()]
        )
      })
      .catch(() => setError("Không tải được sản phẩm"))
      .finally(() => setLoading(false))
  }, [id, accessToken])

  const updateVariant = (tempId: string, field: keyof VariantRow, value: string | boolean) =>
    setVariants((prev) => prev.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSaving(true)
    setSaved(false)
    try {
      const validVariants = variants.filter((v) => v.sku && v.price)
      await backendClientFetch(`/products/${id}`, {
        accessToken,
        method: "PATCH",
        body: JSON.stringify({
          name,
          brand: brand || undefined,
          description: description || undefined,
          isActive,
          images: validVariants
            .filter((v) => v.image)
            .map((v, i) => ({ url: v.image, altText: v.color || v.sku, position: i })),
          variants: validVariants.map((v) => ({
            id: v.id,
            sku: v.sku,
            size: v.size || undefined,
            color: v.color || undefined,
            price: Number(v.price),
            compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
            isActive: v.isActive,
            image: v.image || undefined,
          })),
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lưu thất bại")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await backendClientFetch(`/products/${id}`, { accessToken, method: "DELETE" })
      router.push("/admin/products")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xoá thất bại")
      setDeleting(false)
      setConfirmDelete(false)
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

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white truncate">{name || "Sửa sản phẩm"}</h1>
        </div>
        {saved && (
          <span className="text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
            Đã lưu
          </span>
        )}
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <section className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white">Thông tin cơ bản</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Tên sản phẩm *</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Nike Air Max 270..." />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Brand</label>
              <input value={brand} onChange={(e) => setBrand(e.target.value)} className={inputCls} placeholder="Nike" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1.5">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Mô tả ngắn về sản phẩm..."
            />
          </div>

          <div className="flex items-center gap-3">
            <Toggle value={isActive} onChange={setIsActive} />
            <span className="text-sm text-white/60">{isActive ? "Hiển thị trên storefront" : "Ẩn khỏi storefront"}</span>
          </div>
        </section>

        {/* Variants */}
        <section className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Biến thể ({variants.length})</h2>
              <p className="text-xs text-white/30 mt-0.5">Mỗi biến thể có ảnh riêng</p>
            </div>
            <button
              type="button"
              onClick={() => setVariants((p) => [...p, newVariant()])}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"
            >
              <Plus size={12} /> Thêm biến thể
            </button>
          </div>

          <div className="space-y-4">
            {variants.map((v, i) => (
              <div key={v.tempId} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-white/40">
                    Biến thể {i + 1}
                    {v.id && <span className="ml-2 font-mono text-white/20">{v.id.slice(0, 8)}</span>}
                  </span>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setVariants((p) => p.filter((r) => r.tempId !== v.tempId))}
                      className="text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="flex gap-4">
                  {/* Per-variant image */}
                  <div className="w-[88px] flex-shrink-0">
                    <p className="text-[11px] text-white/30 mb-1">Ảnh</p>
                    <ImageUpload
                      value={v.image}
                      onChange={(url) => updateVariant(v.tempId, "image", url)}
                      folder="toidibangiay/products"
                      aspectRatio="1/1"
                    />
                  </div>

                  {/* Fields */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-white/30 mb-1">SKU *</label>
                      <input value={v.sku} onChange={(e) => updateVariant(v.tempId, "sku", e.target.value)} className={smallInputCls} placeholder="NK-270-BLK-42" />
                    </div>
                    <div>
                      <label className="block text-[11px] text-white/30 mb-1">Size</label>
                      <input value={v.size} onChange={(e) => updateVariant(v.tempId, "size", e.target.value)} className={smallInputCls} placeholder="42" />
                    </div>
                    <div>
                      <label className="block text-[11px] text-white/30 mb-1">Màu</label>
                      <input value={v.color} onChange={(e) => updateVariant(v.tempId, "color", e.target.value)} className={smallInputCls} placeholder="Black" />
                    </div>
                    <div>
                      <label className="block text-[11px] text-white/30 mb-1">Giá *</label>
                      <input type="number" min={0} value={v.price} onChange={(e) => updateVariant(v.tempId, "price", e.target.value)} className={smallInputCls} placeholder="2500000" />
                    </div>
                    <div>
                      <label className="block text-[11px] text-white/30 mb-1">Giá gốc</label>
                      <input type="number" min={0} value={v.compareAtPrice} onChange={(e) => updateVariant(v.tempId, "compareAtPrice", e.target.value)} className={smallInputCls} placeholder="3000000" />
                    </div>
                    <div className="flex items-end gap-2 pb-1">
                      <Toggle value={v.isActive} onChange={(val) => updateVariant(v.tempId, "isActive", val)} />
                      <span className="text-xs text-white/40">{v.isActive ? "Hiển thị" : "Ẩn"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-between pb-8">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Lưu thay đổi
            </button>
            <Link href="/admin/products" className="px-6 py-2.5 text-sm text-white/50 border border-white/[0.08] rounded-xl hover:text-white hover:border-white/20 transition-colors">
              Huỷ
            </Link>
          </div>

          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500/70 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl transition-colors"
            >
              <Trash2 size={14} />
              Xoá sản phẩm
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">Xác nhận xoá?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                {deleting && <Loader2 size={12} className="animate-spin" />}
                Xoá
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-2 text-xs text-white/40 border border-white/[0.08] rounded-lg hover:text-white transition-colors"
              >
                Huỷ
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
