"use client"

import { motion } from "framer-motion"

const SHOE_SIZES = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45]

type Props = {
  selected: number | null
  onSelect: (size: number) => void
  soldOutSizes?: number[]
}

export default function SizePicker({ selected, onSelect, soldOutSizes = [] }: Props) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs tracking-[0.2em] text-white/50 font-semibold uppercase">
          Chọn size
        </p>
        {selected && (
          <span className="text-xs text-white/40">
            EU {selected}
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2.5">
        {SHOE_SIZES.map((size) => {
          const isActive = selected === size
          const isSoldOut = soldOutSizes.includes(size)

          return (
            <motion.button
              key={size}
              whileHover={{ scale: isSoldOut ? 1 : 1.05 }}
              whileTap={{ scale: isSoldOut ? 1 : 0.95 }}
              onClick={() => !isSoldOut && onSelect(size)}
              disabled={isSoldOut}
              className={`relative h-12 rounded-lg text-sm font-medium transition-all duration-300 ${
                isSoldOut
                  ? "border border-white/[0.06] text-white/15 cursor-not-allowed"
                  : isActive
                  ? "border-2 border-red-500 bg-red-500/10 text-white shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                  : "border border-white/[0.1] text-white/70 hover:border-white/30 hover:text-white"
              }`}
            >
              {size}
              {isSoldOut && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="absolute w-[70%] h-px bg-white/15 rotate-[-20deg]" />
                </span>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Size guide link */}
      <button className="mt-3 text-[11px] text-red-500/70 hover:text-red-400 transition-colors tracking-wider uppercase underline underline-offset-2">
        Hướng dẫn chọn size
      </button>
    </div>
  )
}
