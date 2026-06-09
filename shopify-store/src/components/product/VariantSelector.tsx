"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import type { ProductVariant } from "@/types/product"

type Props = {
  variants: ProductVariant[]
  selected: string | null
  onSelect: (variantId: string) => void
}

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫'
}

/**
 * Parse variant titles like "Black / 44 / Male" into structured option groups.
 * Handles single-value titles (like just "Red") as well.
 */
function parseVariantOptions(variants: ProductVariant[]) {
  const parsed = variants.map((v) => {
    const parts = v.title.split(' / ').map((s) => s.trim())
    return {
      variant: v,
      color: parts[0] || v.title,
      size: parts[1] || null,
      gender: parts[2] || null,
    }
  })

  const colors = [...new Set(parsed.map((p) => p.color))]
  const sizes = [...new Set(parsed.map((p) => p.size).filter(Boolean))] as string[]
  const genders = [...new Set(parsed.map((p) => p.gender).filter(Boolean))] as string[]

  return { parsed, colors, sizes, genders }
}

export default function VariantSelector({ variants, selected, onSelect }: Props) {
  const { parsed, colors, sizes, genders } = useMemo(
    () => parseVariantOptions(variants),
    [variants]
  )

  // Determine active selections from the currently selected variant
  const activeEntry = parsed.find((p) => p.variant.id === selected) ?? parsed[0]
  const [activeColor, setActiveColor] = useState(activeEntry?.color ?? "")
  const [activeSize, setActiveSize] = useState(activeEntry?.size ?? null)
  const [activeGender, setActiveGender] = useState(activeEntry?.gender ?? null)

  if (!variants.length) return null

  const hasMultipleOptions = colors.length > 1 || sizes.length > 0 || genders.length > 0
  const isSimple = variants.length === 1 && variants[0].title === "Default Title"
  if (isSimple) return null

  // Find the matching variant for the current selections
  function findVariant(color: string, size: string | null, gender: string | null) {
    return parsed.find(
      (p) =>
        p.color === color &&
        (size === null || p.size === size) &&
        (gender === null || p.gender === gender)
    )?.variant
  }

  // When a selection changes, try to find and select the matching variant
  function handleChange(color: string, size: string | null, gender: string | null) {
    const match = findVariant(color, size, gender)
    if (match) {
      onSelect(match.id)
    }
  }

  // Get available sizes for a given color
  function getSizesForColor(color: string) {
    return parsed.filter((p) => p.color === color && p.size)
  }

  // Get available genders for a given color + size
  function getGendersForColorSize(color: string, size: string | null) {
    return parsed.filter(
      (p) => p.color === color && (size === null || p.size === size) && p.gender
    )
  }

  // Check if ALL variants for a color are sold out
  function isColorSoldOut(color: string) {
    const colorVariants = parsed.filter((p) => p.color === color)
    return colorVariants.every((p) => p.variant.availableForSale === false)
  }

  // Whether a size is sold out for the active color
  function isSizeSoldOut(size: string) {
    const sizeVariants = parsed.filter((p) => p.color === activeColor && p.size === size)
    return sizeVariants.every((p) => p.variant.availableForSale === false)
  }

  // Whether a gender is sold out for the active color + size
  function isGenderSoldOut(gender: string) {
    const genderVariants = parsed.filter(
      (p) => p.color === activeColor && (activeSize === null || p.size === activeSize) && p.gender === gender
    )
    return genderVariants.every((p) => p.variant.availableForSale === false)
  }

  // Get the price range for a color
  function getPriceForColor(color: string) {
    const colorVariants = parsed.filter((p) => p.color === color)
    const prices = colorVariants.map((p) => parseFloat(p.variant.price.amount))
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    if (min === max) return formatVND(min)
    return `${formatVND(min)} – ${formatVND(max)}`
  }

  return (
    <div className="mt-6 space-y-6">
      {/* ——— COLOR PICKER ——— */}
      {colors.length > 1 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] tracking-[0.2em] text-white/50 font-semibold uppercase">
              Chọn màu
            </p>
            <span className="text-[11px] text-white/40">{activeColor}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const isActive = activeColor === color
              const soldOut = isColorSoldOut(color)

              return (
                <motion.button
                  key={color}
                  whileHover={{ scale: soldOut ? 1 : 1.05 }}
                  whileTap={{ scale: soldOut ? 1 : 0.95 }}
                  onClick={() => {
                    if (soldOut) return
                    setActiveColor(color)
                    // Reset size/gender and try to find first available
                    const availableSizes = getSizesForColor(color)
                    const firstAvailableSize = availableSizes.find(
                      (s) => s.variant.availableForSale
                    )
                    const newSize = firstAvailableSize?.size ?? availableSizes[0]?.size ?? null
                    setActiveSize(newSize)
                    const availableGenders = getGendersForColorSize(color, newSize)
                    const firstAvailableGender = availableGenders.find(
                      (g) => g.variant.availableForSale
                    )
                    setActiveGender(firstAvailableGender?.gender ?? availableGenders[0]?.gender ?? null)
                    handleChange(color, newSize, firstAvailableGender?.gender ?? availableGenders[0]?.gender ?? null)
                  }}
                  disabled={soldOut}
                  className={`relative px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                    soldOut
                      ? "border border-white/[0.06] text-white/20 cursor-not-allowed"
                      : isActive
                      ? "border-2 border-red-500 bg-red-500/10 text-white shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                      : "border border-white/[0.1] text-white/70 hover:border-white/30 hover:text-white"
                  }`}
                >
                  <span className={`block ${soldOut ? "line-through" : ""}`}>{color}</span>
                  <span className={`block text-[10px] mt-0.5 ${isActive ? 'text-red-400' : 'text-white/40'}`}>
                    {getPriceForColor(color)}
                  </span>
                  {soldOut && (
                    <span className="absolute -top-2 -right-2 bg-neutral-800 text-white/40 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase">
                      Hết hàng
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      )}

      {/* ——— SIZE PICKER ——— */}
      {sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] tracking-[0.2em] text-white/50 font-semibold uppercase">
              Chọn size
            </p>
            {activeSize && (
              <span className="text-[11px] text-white/40">EU {activeSize}</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isActive = activeSize === size
              const soldOut = isSizeSoldOut(size)
              // Check if this size exists for the active color
              const existsForColor = parsed.some((p) => p.color === activeColor && p.size === size)
              if (!existsForColor) return null

              return (
                <motion.button
                  key={size}
                  whileHover={{ scale: soldOut ? 1 : 1.05 }}
                  whileTap={{ scale: soldOut ? 1 : 0.95 }}
                  onClick={() => {
                    if (soldOut) return
                    setActiveSize(size)
                    // Update gender if needed
                    const availableGenders = getGendersForColorSize(activeColor, size)
                    const firstAvailableGender = availableGenders.find(
                      (g) => g.variant.availableForSale
                    )
                    const newGender = firstAvailableGender?.gender ?? availableGenders[0]?.gender ?? activeGender
                    setActiveGender(newGender)
                    handleChange(activeColor, size, newGender)
                  }}
                  disabled={soldOut}
                  className={`relative h-10 min-w-[2.8rem] px-3 rounded-lg text-xs font-medium transition-all duration-300 ${
                    soldOut
                      ? "border border-white/[0.06] text-white/15 cursor-not-allowed"
                      : isActive
                      ? "border-2 border-red-500 bg-red-500/10 text-white shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                      : "border border-white/[0.1] text-white/70 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {size}
                  {soldOut && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="absolute w-[70%] h-px bg-white/15 rotate-[-20deg]" />
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      )}

      {/* ——— GENDER PICKER ——— */}
      {genders.length > 1 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] tracking-[0.2em] text-white/50 font-semibold uppercase">
              Giới tính
            </p>
            {activeGender && (
              <span className="text-[11px] text-white/40">{activeGender}</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {genders.map((gender) => {
              const isActive = activeGender === gender
              const soldOut = isGenderSoldOut(gender)
              // Check if this gender exists for the active color + size
              const exists = parsed.some(
                (p) => p.color === activeColor && (activeSize === null || p.size === activeSize) && p.gender === gender
              )
              if (!exists) return null

              return (
                <motion.button
                  key={gender}
                  whileHover={{ scale: soldOut ? 1 : 1.05 }}
                  whileTap={{ scale: soldOut ? 1 : 0.95 }}
                  onClick={() => {
                    if (soldOut) return
                    setActiveGender(gender)
                    handleChange(activeColor, activeSize, gender)
                  }}
                  disabled={soldOut}
                  className={`relative px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                    soldOut
                      ? "border border-white/[0.06] text-white/20 cursor-not-allowed"
                      : isActive
                      ? "border-2 border-red-500 bg-red-500/10 text-white shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                      : "border border-white/[0.1] text-white/70 hover:border-white/30 hover:text-white"
                  }`}
                >
                  <span className={soldOut ? "line-through" : ""}>{gender}</span>
                  {soldOut && (
                    <span className="absolute -top-2 -right-2 bg-neutral-800 text-white/40 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase">
                      Hết hàng
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      )}

      {/* ——— SINGLE-OPTION FALLBACK (no "/" in titles) ——— */}
      {!hasMultipleOptions && colors.length >= 1 && (
        <div>
          <p className="text-[11px] tracking-[0.2em] text-white/50 mb-3 font-semibold uppercase">
            Chọn phiên bản
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const isActive = selected === variant.id
              const soldOut = !variant.availableForSale
              const variantPrice = parseFloat(variant.price.amount)

              return (
                <motion.button
                  key={variant.id}
                  whileHover={{ scale: soldOut ? 1 : 1.05 }}
                  whileTap={{ scale: soldOut ? 1 : 0.95 }}
                  onClick={() => !soldOut && onSelect(variant.id)}
                  disabled={soldOut}
                  className={`relative px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                    soldOut
                      ? "border border-white/[0.06] text-white/20 cursor-not-allowed"
                      : isActive
                      ? "border-2 border-red-500 bg-red-500/10 text-white shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                      : "border border-white/[0.1] text-white/70 hover:border-white/30 hover:text-white"
                  }`}
                >
                  <span className={`block ${soldOut ? "line-through" : ""}`}>{variant.title}</span>
                  <span className={`block text-[10px] mt-0.5 ${isActive ? 'text-red-400' : 'text-white/40'}`}>
                    {formatVND(variantPrice)}
                  </span>
                  {soldOut && (
                    <span className="absolute -top-2 -right-2 bg-neutral-800 text-white/40 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase">
                      Hết hàng
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
