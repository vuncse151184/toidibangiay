"use client"

import { ReactLenis } from "lenis/react"
import type { ReactNode } from "react"

export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        duration: 1.4,
        smoothWheel: true,
        touchMultiplier: 1.2,
        wheelMultiplier: 1.0,
        infinite: false,
        autoResize: true,
      }}
    >
      {children}
    </ReactLenis>
  )
}
