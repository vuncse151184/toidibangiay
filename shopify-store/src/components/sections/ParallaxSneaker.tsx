"use client"

import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export default function ParallaxSneaker() {

  const ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])

  return (
    <section ref={ref} className="relative h-[700px] overflow-hidden">

      <motion.div style={{ y }} className="absolute inset-0">

        <Image
          src="/images/shoe1.jpeg"
          alt="sneaker"
          fill
          className="object-cover"
        />

      </motion.div>

      <div className="relative z-10 h-full flex items-center justify-center text-white text-center">

        <div>
          <h2 className="text-5xl font-bold">
            Built For Speed
          </h2>

          <p className="mt-6 text-lg opacity-80">
            Engineered comfort and performance.
          </p>
        </div>

      </div>

    </section>
  )
}