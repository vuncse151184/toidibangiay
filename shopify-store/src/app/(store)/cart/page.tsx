import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Giỏ hàng",
  robots: {
    index: false,
    follow: false,
  },
}

export default function CartPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-white/50">Giỏ hàng đang được hoàn thiện</p>
    </div>
  )
}
