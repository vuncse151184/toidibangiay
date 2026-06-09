"use client"

import { motion, useMotionValue } from "framer-motion"
import { useRef } from "react"

export default function MagneticButton({
  children
}: {
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  function handleMouseMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    x.set((offsetX - centerX) * 0.2)
    y.set((offsetY - centerY) * 0.2)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      {children}
    </motion.div>
  )
}