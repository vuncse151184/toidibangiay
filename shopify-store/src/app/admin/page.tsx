"use client"

import Link from "next/link"
import { Package, ShoppingCart, Warehouse, ArrowRight } from "lucide-react"

const quickLinks = [
  {
    href: "/admin/products",
    icon: Package,
    title: "Quản lý sản phẩm",
    description: "Xem, thêm và chỉnh sửa sản phẩm",
    color: "blue",
  },
  {
    href: "/admin/orders",
    icon: ShoppingCart,
    title: "Quản lý đơn hàng",
    description: "Xem và cập nhật trạng thái đơn hàng",
    color: "green",
  },
  {
    href: "/admin/inventory",
    icon: Warehouse,
    title: "Quản lý tồn kho",
    description: "Kiểm tra và nhập thêm hàng tồn kho",
    color: "yellow",
  },
]

const colorMap = {
  blue: "border-blue-500/20 bg-blue-500/5 text-blue-400",
  green: "border-green-500/20 bg-green-500/5 text-green-400",
  yellow: "border-yellow-500/20 bg-yellow-500/5 text-yellow-400",
}

export default function AdminPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Tổng quan</h1>
        <p className="text-white/40 text-sm mt-1">Quản lý cửa hàng Toidibangiay</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col gap-4 p-6 rounded-2xl border ${colorMap[item.color as keyof typeof colorMap]} hover:opacity-80 transition-opacity group`}
          >
            <item.icon size={28} />
            <div>
              <h2 className="text-white font-semibold text-base">{item.title}</h2>
              <p className="text-white/40 text-sm mt-1">{item.description}</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold tracking-wider uppercase mt-auto opacity-60 group-hover:opacity-100 transition-opacity">
              Xem ngay <ArrowRight size={12} className="ml-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
