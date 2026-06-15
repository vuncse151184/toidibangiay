"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Ruler, AlertCircle } from "lucide-react"
import Image from "next/image"

// Đặt URL ảnh bảng size từ Cloudinary vào đây sau khi upload
// Ví dụ: "https://res.cloudinary.com/dtmy1ys91/image/upload/toidibangiay/size-guide/bang-size.jpg"
const SIZE_GUIDE_IMAGE_URL: string | null = "https://res.cloudinary.com/dtmy1ys91/image/upload/v1781488045/ChatGPT_Image_Jun_15_2026_08_02_48_AM_vc5ilz.png"

  

type Props = {
  isOpen: boolean
  onClose: () => void
  selectedSize?: number | null
}

export default function SizeGuideModal({ isOpen, onClose, selectedSize }: Props) {
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = "hidden"
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      document.body.style.overflow = ""
      document.body.style.paddingRight = ""
    }
    return () => {
      document.body.style.overflow = ""
      document.body.style.paddingRight = ""
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="sg-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0  z-50 bg-black/75 backdrop-blur-sm"
          />

          {/* Panel — bottom sheet on mobile, centered modal on desktop */}
          <motion.div
            key="sg-panel"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", damping: 32, stiffness: 380 }}
            className="fixed inset-x-0 bottom-0 z-50  sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px]"
            style={{
              background: "linear-gradient(180deg, #141414 0%, #0e0e0e 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
            }}
          >
            {/* Drag handle (mobile only) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Ruler size={14} className="text-red-400" />
                </div>
                <h2 className="text-[13px] font-bold tracking-[0.12em] uppercase text-white">
                  Bảng hướng dẫn chọn size
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white/40 hover:text-white transition-all duration-200"
              >
                <X size={14} />
              </button>
            </div>

            {/* Cloudinary image (hiển thị khi đã cấu hình SIZE_GUIDE_IMAGE_URL) */}
            {SIZE_GUIDE_IMAGE_URL && (
              <div className="px-6 pb-4">
                <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02]">
                  <Image
                    src={SIZE_GUIDE_IMAGE_URL}
                    alt="Bảng size giày"
                    width={800}
                    height={450}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            )}

            {/* Tip */}
            <div className="px-6 pb-4">
              <div className="flex gap-3 bg-amber-500/[0.05] border border-amber-500/[0.12] rounded-2xl px-4 py-3">
                <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11.5px] text-white/55 leading-relaxed">
                  Đo bàn chân vào buổi chiều (khi chân nở nhất). Nếu nằm giữa hai size, hãy chọn size lớn hơn.
                </p>
              </div>
            </div> 
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
