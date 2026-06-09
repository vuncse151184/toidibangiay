"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, X } from "lucide-react"

export interface ShoeFilters {
  priceRange: [number, number]
  sizes: number[]
  availability: "all" | "in-stock" | "sale"
  sortBy: "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc"
}

const defaultFilters: ShoeFilters = {
  priceRange: [0, 500],
  sizes: [],
  availability: "all",
  sortBy: "default",
}

const allSizes = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46]

const sortOptions = [
  { value: "default", label: "Mặc định" },
  { value: "price-asc", label: "Giá: Thấp → cao" },
  { value: "price-desc", label: "Giá: Cao → Thấp" },
  { value: "name-asc", label: "Tên: A → Z" },
  { value: "name-desc", label: "Tên: Z → A" },
]

type Props = {
  filters: ShoeFilters
  onChange: (filters: ShoeFilters) => void
  totalResults?: number
}

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-white/[0.06] last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-xs font-bold tracking-[0.2em] text-white/50 uppercase group-hover:text-white/70 transition-colors">
          {title}
        </span>
        <ChevronDown
          size={14}
          className={`text-white/30 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ShoeFilter({ filters, onChange, totalResults }: Props) {
  const activeFilterCount = [
    filters.sizes.length > 0,
    filters.availability !== "all",
    filters.sortBy !== "default",
    filters.priceRange[0] > 0 || filters.priceRange[1] < 500,
  ].filter(Boolean).length

  const updateFilter = <K extends keyof ShoeFilters>(key: K, value: ShoeFilters[K]) => {
    onChange({ ...filters, [key]: value })
  }

  const toggleSize = (size: number) => {
    const next = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size]
    updateFilter("sizes", next)
  }

  const resetFilters = () => onChange(defaultFilters)

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 pb-4 border-b border-white/[0.06]">
        <div>
          <h3 className="text-sm font-bold tracking-[0.15em] text-white uppercase">
            Lọc
          </h3>
          {totalResults !== undefined && (
            <p className="text-[11px] text-white/25 mt-1">
              {totalResults} product{totalResults !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 transition-colors tracking-wider uppercase"
          >
            Clear
            <span className="w-4 h-4 bg-red-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          </button>
        )}
      </div>

      {/* Sort */}
      <FilterSection title="Sort By">
        <div className="space-y-1">
          {sortOptions.map((opt) => {
            const isActive = filters.sortBy === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => updateFilter("sortBy", opt.value as ShoeFilters["sortBy"])}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-200 ${
                  isActive
                    ? "bg-red-600/10 text-red-400 font-medium"
                    : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size (EU)">
        <div className="grid grid-cols-4 gap-1.5">
          {allSizes.map((size) => {
            const isActive = filters.sizes.includes(size)
            return (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`h-9 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-red-600 text-white border border-red-500 shadow-md shadow-red-600/20"
                    : "bg-white/[0.04] text-white/45 border border-white/[0.08] hover:border-white/20 hover:text-white/70"
                }`}
              >
                {size}
              </button>
            )
          })}
        </div>
      </FilterSection>

      {/* Price range */}
      <FilterSection title="Price Range">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-white/25 uppercase tracking-wider mb-1 block">Min</label>
              <input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e) => updateFilter("priceRange", [Number(e.target.value), filters.priceRange[1]])}
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/40 transition-all"
                min={0}
              />
            </div>
            <span className="text-white/15 mt-4 text-xs">—</span>
            <div className="flex-1">
              <label className="text-[10px] text-white/25 uppercase tracking-wider mb-1 block">Max</label>
              <input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e) => updateFilter("priceRange", [filters.priceRange[0], Number(e.target.value)])}
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/40 transition-all"
                min={0}
              />
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability">
        <div className="space-y-1">
          {([
            { value: "all", label: "All Products" },
            { value: "in-stock", label: "In Stock" },
            { value: "sale", label: "On Sale" },
          ] as const).map((opt) => {
            const isActive = filters.availability === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => updateFilter("availability", opt.value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-200 ${
                  isActive
                    ? "bg-red-600/10 text-red-400 font-medium"
                    : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </FilterSection>

      {/* Active filter tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-4">
          {filters.sizes.length > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-[10px] text-red-400">
              Size: {filters.sizes.sort((a, b) => a - b).join(", ")}
              <button onClick={() => updateFilter("sizes", [])} className="hover:text-white ml-0.5">
                <X size={10} />
              </button>
            </span>
          )}
          {filters.availability !== "all" && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-[10px] text-red-400">
              {filters.availability === "in-stock" ? "In Stock" : "On Sale"}
              <button onClick={() => updateFilter("availability", "all")} className="hover:text-white ml-0.5">
                <X size={10} />
              </button>
            </span>
          )}
          {(filters.priceRange[0] > 0 || filters.priceRange[1] < 500) && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-[10px] text-red-400">
              ${filters.priceRange[0]}–${filters.priceRange[1]}
              <button onClick={() => updateFilter("priceRange", [0, 500])} className="hover:text-white ml-0.5">
                <X size={10} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function getVariantSizes(title: string) {
  return Array.from(
    new Set(
      (title.match(/\b(3[6-9]|4[0-6])\b/g) ?? []).map((value) => Number.parseInt(value, 10))
    )
  )
}

/**
 * Apply filters to a product list (client-side).
 */
export function applyFilters<T extends {
  variants: {
    title: string
    price: { amount: string }
    availableForSale: boolean
    compareAtPrice: { amount: string; currencyCode: string } | null
  }[]
  title: string
}>(
  products: T[],
  filters: ShoeFilters
): T[] {
  let filtered = [...products]

  // Price range
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < 500) {
    filtered = filtered.filter((p) => {
      const price = parseFloat(p.variants[0]?.price.amount ?? "0")
      return price >= filters.priceRange[0] && price <= filters.priceRange[1]
    })
  }

  // Availability
  if (filters.availability === "in-stock") {
    filtered = filtered.filter((p) =>
      p.variants.some((v) => v.availableForSale)
    )
  } else if (filters.availability === "sale") {
    filtered = filtered.filter((p) =>
      p.variants.some((v) => v.compareAtPrice && parseFloat(v.compareAtPrice.amount) > parseFloat(v.price.amount))
    )
  }

  // Sizes
  if (filters.sizes.length > 0) {
    filtered = filtered.filter((p) =>
      p.variants.some((variant) =>
        getVariantSizes(variant.title).some((size) => filters.sizes.includes(size))
      )
    )
  }

  // Sort
  if (filters.sortBy === "price-asc") {
    filtered.sort((a, b) => parseFloat(a.variants[0]?.price.amount ?? "0") - parseFloat(b.variants[0]?.price.amount ?? "0"))
  } else if (filters.sortBy === "price-desc") {
    filtered.sort((a, b) => parseFloat(b.variants[0]?.price.amount ?? "0") - parseFloat(a.variants[0]?.price.amount ?? "0"))
  } else if (filters.sortBy === "name-asc") {
    filtered.sort((a, b) => a.title.localeCompare(b.title))
  } else if (filters.sortBy === "name-desc") {
    filtered.sort((a, b) => b.title.localeCompare(a.title))
  }

  return filtered
}
