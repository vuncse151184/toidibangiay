import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Thanh toán",
  description: "Hoàn tất đơn hàng với quy trình thanh toán an toàn tại Toidibangiay.",
  robots: { index: false, follow: false },
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
