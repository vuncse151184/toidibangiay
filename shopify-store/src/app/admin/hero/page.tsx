"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/auth.store"
import { backendClientFetch } from "@/lib/backend-client"
import { Plus, Trash2, Save, RefreshCw, GripVertical, Image as ImageIcon } from "lucide-react"

interface HeroSlide {
  id: string
  src: string
  label: string
  accent: string
}

interface HeroBanner {
  key: string
  titleLeft: string
  titleRight: string
  subtitle: string
  badge: string
  watermark: string
  productName: string
  price: string
  priceLabel: string
  description: string
  ctaPrimary: string
  ctaSecondary: string
  ctaLink: string
  slides: HeroSlide[]
  isActive: boolean
}

const DEFAULT: Omit<HeroBanner, "key"> = {
  titleLeft: "Jump",
  titleRight: "man",
  subtitle: "Giày Bóng Rổ",
  badge: "2021 PF",
  watermark: "JORDAN",
  productName: "JORDAN JUMPMAN 2021 PF",
  price: "3.200.000₫",
  priceLabel: "độc quyền",
  description: "",
  ctaPrimary: "Mua ngay",
  ctaSecondary: "Thêm vào giỏ",
  ctaLink: "/products",
  slides: [],
  isActive: true,
}

function Field({ label, value, onChange, mono }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean }) {
  return (
    <div>
      <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50 ${mono ? "font-mono" : ""}`}
      />
    </div>
  )
}

export default function AdminHeroPage() {
  const token = useAuthStore((s) => s.token)
  const [data, setData] = useState<Omit<HeroBanner, "key">>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    backendClientFetch<HeroBanner>("/banners/hero")
      .then((d) => setData({ ...DEFAULT, ...d }))
      .catch(() => setData(DEFAULT))
      .finally(() => setLoading(false))
  }, [])

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const save = async () => {
    setSaving(true)
    try {
      await backendClientFetch("/banners/hero/main", {
        method: "PUT",
        accessToken: token ?? undefined,
        body: JSON.stringify(data),
      })
      showToast("Đã lưu thành công")
    } catch {
      showToast("Lỗi khi lưu banner", false)
    } finally {
      setSaving(false)
    }
  }

  const setField = (key: keyof Omit<HeroBanner, "key" | "slides" | "isActive">) =>
    (v: string) => setData((prev) => ({ ...prev, [key]: v }))

  const addSlide = () =>
    setData((prev) => ({
      ...prev,
      slides: [...prev.slides, { id: `slide-${Date.now()}`, src: "", label: "", accent: "#dc2626" }],
    }))

  const removeSlide = (i: number) =>
    setData((prev) => ({ ...prev, slides: prev.slides.filter((_, idx) => idx !== i) }))

  const updateSlide = (i: number, field: keyof HeroSlide, val: string) =>
    setData((prev) => {
      const slides = [...prev.slides]
      slides[i] = { ...slides[i], [field]: val }
      return { ...prev, slides }
    })

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Hero Banner</h1>
          <p className="text-white/40 text-sm mt-1">Chỉnh sửa nội dung hero section trang chủ</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.open("/", "_blank")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm transition-colors"
          >
            <RefreshCw size={14} />
            Xem live
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Typography */}
        <section className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-6">
          <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Typography & Nội dung</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Chữ trái lớn" value={data.titleLeft} onChange={setField("titleLeft")} />
            <Field label="Chữ phải lớn" value={data.titleRight} onChange={setField("titleRight")} />
            <Field label="Subtitle nhỏ" value={data.subtitle} onChange={setField("subtitle")} />
            <Field label="Badge góc phải" value={data.badge} onChange={setField("badge")} />
            <Field label="Watermark nền" value={data.watermark} onChange={setField("watermark")} />
            <Field label="Tên sản phẩm" value={data.productName} onChange={setField("productName")} />
          </div>
        </section>

        {/* Price & CTA */}
        <section className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-6">
          <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Giá & Nút CTA</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Giá hiển thị" value={data.price} onChange={setField("price")} />
            <Field label="Nhãn giá" value={data.priceLabel} onChange={setField("priceLabel")} />
            <Field label="Nút chính" value={data.ctaPrimary} onChange={setField("ctaPrimary")} />
            <Field label="Nút phụ" value={data.ctaSecondary} onChange={setField("ctaSecondary")} />
            <div className="col-span-2">
              <Field label="Link CTA" value={data.ctaLink} onChange={setField("ctaLink")} mono />
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-6">
          <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Mô tả cảm hứng</h2>
          <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">Nội dung</label>
          <textarea
            value={data.description}
            onChange={(e) => setData((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 resize-none"
          />
        </section>

        {/* Slides */}
        <section className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Slides màu sắc ({data.slides.length})
            </h2>
            <button
              onClick={addSlide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/70 hover:text-white text-xs font-medium transition-colors"
            >
              <Plus size={13} />
              Thêm slide
            </button>
          </div>

          {data.slides.length === 0 && (
            <p className="text-white/20 text-sm text-center py-6 border border-dashed border-white/10 rounded-lg">
              Chưa có slide — nhấn &quot;Thêm slide&quot; để bắt đầu
            </p>
          )}

          <div className="space-y-3">
            {data.slides.map((slide, i) => (
              <div key={slide.id} className="flex items-start gap-3 p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <GripVertical size={16} className="text-white/20 mt-2 flex-shrink-0" />

                {/* Color swatch */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg border border-white/20" style={{ backgroundColor: slide.accent }} />
                  <input
                    type="color"
                    value={slide.accent}
                    onChange={(e) => updateSlide(i, "accent", e.target.value)}
                    className="w-8 h-5 cursor-pointer bg-transparent border-0 p-0 rounded"
                    title="Accent color"
                  />
                </div>

                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-white/30 mb-1">ID</label>
                    <input
                      value={slide.id}
                      onChange={(e) => updateSlide(i, "id", e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-red-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/30 mb-1">Tên màu</label>
                    <input
                      value={slide.label}
                      onChange={(e) => updateSlide(i, "label", e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-red-500/40"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-white/30 mb-1">URL ảnh</label>
                    <div className="flex items-center gap-2">
                      <ImageIcon size={13} className="text-white/20 flex-shrink-0" />
                      <input
                        value={slide.src}
                        onChange={(e) => updateSlide(i, "src", e.target.value)}
                        placeholder="/images/shoe.png"
                        className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-red-500/40 placeholder:text-white/20"
                      />
                    </div>
                  </div>
                </div>

                <button onClick={() => removeSlide(i)} className="text-white/20 hover:text-red-400 transition-colors mt-1 flex-shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Active toggle */}
        <section className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-white font-medium">Hiển thị banner</p>
            <p className="text-xs text-white/40 mt-0.5">Tắt sẽ ẩn hero section khỏi trang chủ</p>
          </div>
          <button
            onClick={() => setData((prev) => ({ ...prev, isActive: !prev.isActive }))}
            className={`relative w-12 h-6 rounded-full transition-colors ${data.isActive ? "bg-red-600" : "bg-white/10"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${data.isActive ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
        </section>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 text-white text-sm px-4 py-3 rounded-xl shadow-xl border ${toast.ok ? "bg-neutral-900 border-white/10" : "bg-red-900/80 border-red-500/30"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
