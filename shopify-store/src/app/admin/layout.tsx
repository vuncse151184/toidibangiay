"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  LogOut,
  ChevronRight,
  Image,
} from "lucide-react"
import { useAuthStore, type AuthState } from "@/store/auth.store"

const navItems = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
  { href: "/admin/inventory", label: "Tồn kho", icon: Warehouse },
  { href: "/admin/hero", label: "Hero Banner", icon: Image },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s: AuthState) => s.user)
  const initialized = useAuthStore((s: AuthState) => s.initialized)
  const logout = useAuthStore((s: AuthState) => s.logout)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!initialized) return
    const isAdmin = user?.roles?.includes("admin") || user?.roles?.includes("ADMIN")
    if (!isAdmin) {
      router.replace(`/login?callbackUrl=${encodeURIComponent("/admin")}`)
    }
  }, [initialized, user, router])

  if (!initialized) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isAdmin = user?.roles?.includes("admin") || user?.roles?.includes("ADMIN")
  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-neutral-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-white/[0.06] flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/[0.06]">
          <Link href="/" className="text-white font-bold text-sm tracking-wider uppercase">
            toidibangiay
            <span className="ml-2 text-[10px] text-red-500 font-semibold tracking-widest">ADMIN</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-red-600/15 text-red-400 border border-red-600/20"
                    : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <item.icon size={16} className={isActive ? "text-red-400" : "text-white/40 group-hover:text-white/70"} />
                {item.label}
                {isActive && <ChevronRight size={14} className="ml-auto text-red-400/60" />}
              </Link>
            )
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {(user?.fullName || user?.email || "A").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {user?.fullName || user?.email?.split("@")[0]}
              </p>
              <p className="text-white/40 text-[11px] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={async () => { await logout(); router.push("/") }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] rounded-lg transition-colors"
          >
            <LogOut size={13} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  )
}
