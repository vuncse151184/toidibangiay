"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react"
import ImageUpload from "@/components/ui/ImageUpload"
import { backendClientFetch } from "@/lib/backend-client"
import { useAuthStore, type AuthState } from "@/store/auth.store"

type VariantRow = {
  tempId: string
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

export default function AdminProductNewPage() {
  const router = useRouter()
  const accessToken = useAuthStore((s: AuthState) => s.accessToken)

  const [name, setName] = useState("")
  const [brand, setBrand] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [variants, setVariants] = useState<VariantRow[]>([newVariant()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const updateVariant = (tempId: string, field: keyof VariantRow, value: string | boolean) =>
    setVariants((prev) => prev.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSaving(true)
    try {
      const validVariants = variants.filter((v) => v.sku && v.price)
      await backendClientFetch("/products", {
        accessToken,
        method: "POST",
        body: JSON.stringify({
          name,
          brand: brand || undefined,
          description: description || undefined,
          isActive,
          // derive product-level images from variant images (for storefront gallery)
          images: validVariants
            .filter((v) => v.image)
            .map((v, i) => ({ url: v.image, altText: v.color || v.sku, position: i })),
          variants: validVariants.map((v) => ({
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
      router.push("/admin/products")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lưu thất bại")
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-white">Thêm sản phẩm</h1>
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
                  <span className="text-xs text-white/40">Biến thể {i + 1}</span>
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
        <div className="flex items-center gap-3 pb-8">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Tạo sản phẩm
          </button>
          <Link href="/admin/products" className="px-6 py-2.5 text-sm text-white/50 border border-white/[0.08] rounded-xl hover:text-white hover:border-white/20 transition-colors">
            Huỷ
          </Link>
        </div>
      </form>
    </div>
  )
}
