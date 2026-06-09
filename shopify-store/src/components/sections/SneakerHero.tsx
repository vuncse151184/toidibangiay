"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { backendClientFetch } from "@/lib/backend-client"

export interface HeroSlide {
  id: string
  src: string
  label: string
  accent: string
}

export interface HeroBannerData {
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

const FALLBACK_SLIDES: HeroSlide[] = [
  { id: "white-red", src: "/images/hero-shoe (1).png", label: "Trắng / Đỏ", accent: "#dc2626" },
  { id: "purple", src: "/images/shoe-purple (1).png", label: "Tím", accent: "#a855f7" },
  { id: "green", src: "/images/shoe-green (1).png", label: "Xanh lá", accent: "#22c55e" },
  { id: "red", src: "/images/shoe-red (1).png", label: "Đỏ", accent: "#ef4444" },
  { id: "pink", src: "/images/shoe-pink (1).png", label: "Hồng", accent: "#ec4899" },
]

const FALLBACK: HeroBannerData = {
  titleLeft: "Jump", titleRight: "man",
  subtitle: "Giày Bóng Rổ", badge: "2021 PF", watermark: "JORDAN",
  productName: "JORDAN JUMPMAN 2021 PF", price: "3.200.000₫", priceLabel: "độc quyền",
  description: "Lấy cảm hứng từ thiết kế giày thi đấu Air Jordan mới nhất, Jordan Jumpman 2021 giúp các cầu thủ trẻ nâng tầm cuộc chơi.",
  ctaPrimary: "Mua ngay", ctaSecondary: "Thêm vào giỏ", ctaLink: "/products",
  slides: FALLBACK_SLIDES, isActive: true,
}

const AUTO_SLIDE_INTERVAL_MS = 4000

export default function SneakerHero() {
  const [banner, setBanner] = useState<HeroBannerData>(FALLBACK)
  const colorVariants = banner.slides.length > 0 ? banner.slides : FALLBACK_SLIDES
  const [activeColor, setActiveColor] = useState(colorVariants[0]?.id ?? "white-red")

  useEffect(() => {
    backendClientFetch<HeroBannerData>("/banners/hero")
      .then((data) => {
        setBanner(data)
        setActiveColor(data.slides?.[0]?.id ?? "white-red")
      })
      .catch(() => { /* keep FALLBACK */ })
  }, [])

  useEffect(() => {
    const currentIndex = colorVariants.findIndex((variant) => variant.id === activeColor)
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % colorVariants.length : 0

    const intervalId = window.setInterval(() => {
      setActiveColor(colorVariants[nextIndex].id)
    }, AUTO_SLIDE_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [activeColor])

  const activeShoe = colorVariants.find(v => v.id === activeColor) ?? colorVariants[0]
  const accent = activeShoe.accent

  return (
    <section className="relative min-h-svh bg-black text-white overflow-hidden flex flex-col">

      {/* ——— BACKGROUND LAYERS ——— */}

      {/* Crossfade color layers */}
      {colorVariants.map((v) => (
        <div
          key={v.id}
          className="absolute inset-0 transition-opacity duration-700 ease-out will-change-[opacity]"
          style={{ opacity: activeColor === v.id ? 1 : 0 }}
        >
          <div
            className="absolute inset-0 opacity-25"
            style={{ background: `radial-gradient(ellipse at 30% 50%, ${v.accent}4D, transparent 60%)` }}
          />
          <div
            className="absolute inset-0 opacity-20"
            style={{ background: `radial-gradient(ellipse at 80% 30%, ${v.accent}33, transparent 50%)` }}
          />
        </div>
      ))}

      {/* Ghost watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden="true"
      >
        <span className="font-[var(--font-display)] text-[25vw] md:text-[18vw] font-bold text-white/[0.06] tracking-[0.15em] uppercase">
          {banner.watermark}
        </span>
      </div>

      {/* Decorative arc lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1400 900" fill="none" preserveAspectRatio="none">
        <motion.ellipse
          cx="700" cy="450" rx="500" ry="350"
          stroke="rgba(255,255,255,0.06)" strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        />
        <motion.ellipse
          cx="700" cy="450" rx="600" ry="400"
          stroke="rgba(255,255,255,0.04)" strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, delay: 0.8 }}
        />
      </svg>


      {/* ——— MAIN CONTENT ——— */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pt-20 pb-4 md:pb-6 flex-1 flex flex-col">

        {/* HERO CENTER: Big shoe + split typography */}
        <div className="relative flex items-center justify-center flex-1">

          {/* "Jump" text — left side */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute left-0 sm:-left-2 md:-left-[5%] z-10 pointer-events-none"
          >
            <span
              className="font-[var(--font-display)] tracking-widest text-[clamp(40px,12vw,140px)] font-bold italic leading-none"
              style={{ color: accent, transition: "color 0.5s ease" }}
            >
              {banner.titleLeft}
            </span>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="absolute bottom-10 sm:bottom-8 md:bottom-20 lg:bottom-40 left-0 md:left-[5%] z-5 italic text-gray-400 text-xs sm:text-sm md:text-lg tracking-[0.3em] sm:tracking-[0.5em] font-light pointer-events-none"
            >
              {banner.subtitle}
            </motion.p>
          </motion.div>

          {/* "force" text — right side */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute right-0 sm:right-0 md:right-[5%] z-[5] pointer-events-none"
          >
            <span className="font-[var(--font-display)] text-[clamp(40px,12vw,140px)] font-bold italic text-white leading-none">
              {banner.titleRight}
            </span>
          </motion.div>

          {/* "2021 PF" badge — upper right */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute top-[40%] sm:top-[20%] md:top-1/4 right-[5%] sm:right-[8%] md:right-[15%] z-5 pointer-events-none"
          >
            <span
              className="font-[var(--font-display)] italic text-[clamp(16px,3vw,48px)] font-bold tracking-widest"
              style={{ color: accent, transition: "color 0.5s ease" }}
            >
              {banner.badge}
            </span>
          </motion.div>



          {/* HERO SHOE IMAGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: -5 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative z-10 w-[clamp(220px,55vw,650px)] h-[clamp(180px,42vw,500px)]"
          >
            {/* Glow behind shoe */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {colorVariants.map((v) => (
                <div
                  key={v.id}
                  className="absolute w-[70%] h-[50%] rounded-full blur-[60px] md:blur-[80px] transition-opacity duration-500 ease-out will-change-[opacity]"
                  style={{
                    backgroundColor: v.accent,
                    opacity: activeColor === v.id ? 0.5 : 0,
                  }}
                />
              ))}
            </div>

            {/* Shoe images with crossfade */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeShoe.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={activeShoe.src}
                  alt="Jordan Jumpman 2021 PF"
                  fill
                  priority
                  className="object-contain"
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

        </div>

        {/* ——— BOTTOM ROW ——— */}
        <div className="mt-auto pt-4 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-end">

          {/* BOTTOM LEFT: Color picker + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 md:gap-4 items-start sm:items-end md:items-start lg:items-end"
          >
            {/* Color picker */}
            <div>
              <p className="text-xs tracking-[0.2em] text-gray-400 mb-2 font-semibold">CHỌN MÀU :</p>
              <div className="flex gap-2 md:gap-2.5">
                {colorVariants.map((variant, i) => (
                  <motion.button
                    key={variant.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 1 + i * 0.08 }}
                    onClick={() => setActiveColor(variant.id)}
                    className={`relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-md overflow-hidden border-2 hover:scale-110 ${activeColor === variant.id
                      ? "border-current"
                      : "border-white/20 hover:border-white/50"
                      }`}
                    style={{
                      borderColor: activeColor === variant.id ? variant.accent : undefined,
                      boxShadow: activeColor === variant.id ? `0 0 12px ${variant.accent}80` : "none",
                      transition: "border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease",
                    }}
                    aria-label={`Chọn màu ${variant.label}`}
                  >
                    <Image
                      src={variant.src}
                      alt={variant.label}
                      fill
                      className="object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <Link
                href={banner.ctaLink}
                className="px-4 sm:px-5 py-2 sm:py-2.5 border-2 border-white text-white text-[10px] sm:text-xs font-bold tracking-[0.15em] rounded-sm hover:bg-white hover:text-black transition-colors duration-300 uppercase"
              >
                {banner.ctaSecondary}
              </Link>
              <Link
                href={banner.ctaLink}
                className="px-4 sm:px-5 py-2 sm:py-2.5 border-2 border-white bg-white text-black text-[10px] sm:text-xs font-bold tracking-[0.15em] rounded-sm hover:bg-transparent hover:text-white transition-colors duration-300 uppercase"
              >
                {banner.ctaPrimary}
              </Link>
            </div>
          </motion.div>

          {/* BOTTOM CENTER: Price & product name */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-center"
          >
            <div className="flex items-baseline gap-2 justify-center">
              <span
                className="text-2xl sm:text-3xl md:text-4xl tracking-widest font-bold font-[var(--font-display)]"
                style={{ color: accent, transition: "color 0.5s ease" }}
              >
                {banner.price}
              </span>
              <span
                className="text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-sm tracking-wider uppercase"
                style={{ backgroundColor: accent, transition: "background-color 0.5s ease" }}
              >
                {banner.priceLabel}
              </span>
            </div>
            <p className="mt-0.5 text-xs sm:text-sm font-bold tracking-[0.1em] text-white/90">
              {banner.productName}
            </p>
          </motion.div>

          {/* BOTTOM RIGHT: Inspiration */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-center md:text-right"
          >
            <h3 className="text-xs sm:text-sm font-bold tracking-[0.2em] text-white/80 mb-1 uppercase">Cảm Hứng</h3>
            <p className="text-[11px] line-clamp-2 sm:text-xs leading-relaxed text-gray-500 max-w-[280px] mx-auto md:ml-auto md:mr-0">
              {banner.description}
            </p>
          </motion.div>

        </div>
      </div>

    </section>
  )
}
