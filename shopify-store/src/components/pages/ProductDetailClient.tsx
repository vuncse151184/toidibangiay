"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Heart, RotateCcw, Share2, Shield, Truck } from "lucide-react"
import Link from "next/link"
import AddToCartButton from "@/components/product/AddToCartButton"
import ProductCard from "@/components/product/ProductCard"
import ProductGallery from "@/components/product/ProductGallery"
import VariantSelector from "@/components/product/VariantSelector"
import { useProduct } from "@/hooks/useProduct"
import { useProducts } from "@/hooks/useProducts"

function ProductSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-8 pt-28 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="aspect-square rounded-2xl bg-white/[0.04] animate-pulse" />
        <div className="space-y-6 py-4">
          <div className="h-4 bg-white/[0.06] rounded w-24 animate-pulse" />
          <div className="h-10 bg-white/[0.06] rounded w-3/4 animate-pulse" />
          <div className="h-8 bg-white/[0.06] rounded w-32 animate-pulse" />
          <div className="h-20 bg-white/[0.04] rounded w-full animate-pulse" />
          <div className="h-14 bg-white/[0.06] rounded w-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}

function formatVND(amount: number) {
  return `${new Intl.NumberFormat("vi-VN").format(amount)}₫`
}

export default function ProductDetailClient({ slug }: { slug: string }) {
  const { data: product, isLoading, error } = useProduct(slug)
  const { data: allProducts } = useProducts()
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)

  const activeVariant = useMemo(() => {
    if (!product) return null
    if (selectedVariant) {
      return product.variants.find((variant) => variant.id === selectedVariant) ?? product.variants[0]
    }

    return product.variants[0]
  }, [product, selectedVariant])

  const price = activeVariant ? Number.parseFloat(activeVariant.price.amount) : 0
  const compareAtPrice = activeVariant?.compareAtPrice
    ? Number.parseFloat(activeVariant.compareAtPrice.amount)
    : null
  const isOnSale = compareAtPrice && compareAtPrice > price
  const discount = isOnSale ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0

  const relatedProducts = useMemo(() => {
    if (!allProducts || !product) return []
    return allProducts.filter((item) => item.id !== product.id).slice(0, 4)
  }, [allProducts, product])

  if (isLoading) return <ProductSkeleton />

  if (error || !product) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6">
        <p className="text-red-400 text-lg font-bold mb-2">Không tìm thấy sản phẩm</p>
        <p className="text-white/30 text-sm mb-8">
          Sản phẩm bạn đang tìm không tồn tại hoặc đã bị xoá.
        </p>
        <Link
          href="/"
          className="text-red-500 text-xs font-bold tracking-wider uppercase hover:text-red-400 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={14} />
          Quay lại cửa hàng
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_30%_20%,rgba(220,38,38,0.15),transparent_60%)]" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-8 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/40 text-xs font-medium tracking-wider uppercase hover:text-white/70 transition-colors"
          >
            <ArrowLeft size={14} />
            Quay lại cửa hàng
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <ProductGallery images={product.images} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="py-2"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-[2px] bg-red-500" />
              <span className="text-red-500 text-xs font-bold tracking-[0.3em] uppercase">
                Độc quyền
              </span>
            </div>

            <h1 className="text-xl md:text-4xl lg:text-2xl font-bold font-[var(--font-display)] tracking-tight text-white leading-tight">
              {product.title}
            </h1>

            <div className="flex items-baseline gap-4 mt-5">
              <span className="text-3xl font-bold text-red-500 font-[var(--font-display)]">
                {formatVND(price)}
              </span>
              {isOnSale && compareAtPrice && (
                <>
                  <span className="text-lg text-white/30 line-through">
                    {formatVND(compareAtPrice)}
                  </span>
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase shadow-lg shadow-red-600/30">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            <p className="mt-6 text-[12px] md:text-sm lg:text-sm leading-relaxed text-white/50 max-w-lg">
              {product.description}
            </p>

            <VariantSelector
              variants={product.variants}
              selected={selectedVariant ?? product.variants[0]?.id ?? null}
              onSelect={setSelectedVariant}
            />

            <div className="mt-8 space-y-3">
              <AddToCartButton
                variantId={activeVariant?.id ?? ""}
                disabled={!activeVariant || !activeVariant.availableForSale}
                optimistic={product ? {
                  productId: product.id,
                  title: product.title,
                  variantLabel: activeVariant?.title,
                  price,
                  image: product.images[0]?.url,
                } : undefined}
              />

              <button className="flex items-center justify-center gap-3 w-full py-4 rounded-lg text-sm font-bold tracking-[0.15em] uppercase border-2 border-white/[0.15] text-white hover:border-white/30 hover:bg-white/[0.03] transition-all duration-300">
                Mua ngay
              </button>
            </div>

            <div className="flex gap-4 mt-6">
              <button className="flex items-center gap-2 text-xs text-white/40 hover:text-red-400 transition-colors tracking-wider uppercase">
                <Heart size={16} />
                Yêu thích
              </button>
              <button className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors tracking-wider uppercase">
                <Share2 size={16} />
                Chia sẻ
              </button>
            </div>

            <div className="mt-10 pt-8 border-t border-white/[0.06] grid grid-cols-3 gap-4">
              {[
                { icon: Truck, label: "Miễn phí vận chuyển", desc: "Đơn hàng trên 500.000₫" },
                { icon: Shield, label: "Thanh toán an toàn", desc: "Bảo mật 100%" },
                { icon: RotateCcw, label: "Đổi trả dễ dàng", desc: "Trong vòng 30 ngày" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="text-center">
                  <Icon size={20} className="mx-auto text-red-500/60 mb-2" />
                  <p className="text-[11px] font-semibold text-white/60 tracking-wider uppercase">{label}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {relatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-24"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-[2px] bg-red-500" />
              <span className="text-red-500 text-xs font-bold tracking-[0.3em] uppercase">
                Có thể bạn cũng thích
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  )
}
