"use client"

import { Search, ShoppingCart } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

export default function HeroNavbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="absolute top-0 left-0 w-full z-50"
    >
      <div className="max-w-[1400px] mx-auto px-8 h-20 flex items-center justify-between text-white">

        {/* Left: Jumpman + Nike logos */}
        <div className="flex items-center gap-4">
          {/* Jumpman silhouette SVG */}
          <Image src="https://res.cloudinary.com/dtov4zdy4/image/upload/v1773218437/ChatGPT_Image_Mar_11_2026_03_37_06_PM_1_iolztk.png" alt="Jumpman" width={120} height={120} />
        </div>

        {/* Center: Nav links */}
        <div className="hidden md:flex gap-10 text-[13px] font-semibold tracking-[0.25em] uppercase">
          <a href="#" className="text-red-500 border-b-2 border-red-500 pb-1 transition-colors">TRANG CHỦ</a>
          <a href="#" className="hover:text-red-400 transition-colors cursor-pointer">NAM</a>
          <a href="#" className="hover:text-red-400 transition-colors cursor-pointer">NỮ</a>
          <a href="#" className="hover:text-red-400 transition-colors cursor-pointer">TRẺ EM</a>
          <a href="#" className="hover:text-red-400 transition-colors cursor-pointer">GIẢM GIÁ</a>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-5">
          <button className="hover:text-red-400 transition-colors" aria-label="Tìm kiếm">
            <Search size={20} />
          </button>
          <button className="hover:text-red-400 transition-colors" aria-label="Giỏ hàng">
            <ShoppingCart size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 border-2 border-white/30 cursor-pointer" />
        </div>

      </div>
    </motion.nav>
  )
}