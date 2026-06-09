"use client"

import { motion } from "framer-motion"
import ProductGrid from "@/components/product/ProductGrid"
import Link from "next/link"

export default function FeaturedProducts() {
  return (
    <section className="relative bg-black py-20 md:py-28 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_50%_0%,rgba(220,38,38,0.15),transparent_60%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12 md:mb-16 flex "
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-[2px] bg-red-500" />
              <span className="text-red-500 text-xs font-bold tracking-[0.3em] uppercase">
                Bộ Sưu Tập
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-[var(--font-display)] tracking-tight text-white">
              Sản Phẩm Nổi Bật
            </h2>
            <p className="mt-3 text-sm md:text-base text-white/40 max-w-lg">
              Khám phá bộ sưu tập giày sneaker và phụ kiện độc quyền của chúng tôi.
            </p>
          </div> 
        </motion.div>

        {/* Product grid */}
        <ProductGrid />
      </div>
    </section>
  )
}
