"use client"

import { motion } from "framer-motion"

export default function Hero() {
  return (
    <section className="h-screen flex items-center justify-center">
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl font-bold tracking-tight"
        >
          Next Generation Sneakers
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-xl text-gray-500"
        >
          Performance meets style.
        </motion.p>
      </div>
    </section>
  )
}