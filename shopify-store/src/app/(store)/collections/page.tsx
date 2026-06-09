"use client"

import { motion, type Variants } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useCollections } from "@/hooks/useCollections"
import ProductCard from "@/components/product/ProductCard"

function SectionSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-7 bg-white/[0.06] rounded w-48 animate-pulse" />
        <div className="h-4 bg-white/[0.06] rounded w-20 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.06] animate-pulse">
            <div className="aspect-square bg-white/[0.06]" />
            <div className="p-4 space-y-2.5">
              <div className="h-4 bg-white/[0.08] rounded-md w-3/4" />
              <div className="h-4 bg-white/[0.08] rounded-md w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
}

export default function CollectionsPage() {
  const { data: collections, isLoading, error } = useCollections()

  return (
    <div className="min-h-screen bg-black">
      {/* Background */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_50%_0%,rgba(220,38,38,0.15),transparent_60%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-8 pt-28 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 md:mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-red-500" />
            <span className="text-red-500 text-xs font-bold tracking-[0.3em] uppercase">
              Browse
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-[var(--font-display)] tracking-tight text-white">
            Collections
          </h1>
          <p className="mt-4 text-sm md:text-base text-white/40 max-w-lg">
            Explore our curated collections of exclusive sneakers and gear.
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 text-sm">Failed to load collections</p>
            <p className="text-white/30 text-xs mt-1">Please try again later</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-12">
            {Array.from({ length: 3 }).map((_, i) => (
              <SectionSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Collection sections */}
        {collections && collections.length > 0 && (
          <div className="space-y-10">
            {collections.map((collection, index) => (
              <motion.section
                key={collection.id}
                variants={sectionVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                {/* Section header */}
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-display)] tracking-tight text-white">
                      {collection.title}
                    </h2>
                    {collection.description && (
                      <p className="mt-2 text-sm text-white/35 max-w-md line-clamp-1">
                        {collection.description}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/collections/${collection.handle}`}
                    className="group flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-white/40 hover:text-red-400 transition-colors duration-300 flex-shrink-0"
                  >
                    View All
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform duration-300"
                    />
                  </Link>
                </div>

                {/* Product previews */}
                {collection.products.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
                    {collection.products.slice(0, 4).map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <p className="text-white/25 text-sm">No products in this collection yet</p>
                  </div>
                )}

                {/* Divider */}
                {/* <div className="mt-16 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" /> */}
              </motion.section>
            ))}
          </div>
        )}

        {/* Empty */}
        {collections && collections.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg">No collections found</p>
            <Link
              href="/"
              className="mt-4 inline-block text-red-500 text-xs font-bold tracking-wider uppercase hover:text-red-400 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
