"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ShoppingBag, Menu, X, User, LogOut, Package, ChevronDown } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useAuthStore, type AuthState } from "@/store/auth.store"
import { useCartStore, selectTotalItems } from "@/store/cart.store"
import CartDrawer from "@/components/cart/CartDrawer"
import SearchOverlay from "@/components/layout/SearchOverlay"

const navLinks = [
  { href: "/", label: "HOME" },
  { href: "/shop", label: "SHOP" },
  { href: "/collections", label: "COLLECTIONS" },
  { href: "/about", label: "ABOUT" },
]

function UserDropdown() {
  const user = useAuthStore((s: AuthState) => s.user)
  const logout = useAuthStore((s: AuthState) => s.logout)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  if (!user) {
    return (
      <Link
        href="/login"
        className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/15 hover:border-red-500/40 transition-all duration-300 hidden sm:flex items-center justify-center text-white/70"
        aria-label="Đăng nhập"
      >
        <User size={16} />
      </Link>
    )
  }

  const displayName = user.fullName || user.email.split("@")[0]
  const initials = displayName.charAt(0).toUpperCase()

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    router.push("/")
  }

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.12] hover:border-red-500/40 transition-all duration-300 text-white/80 hover:text-white"
      >
        <span className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
          {initials}
        </span>
        <span className="text-[12px] font-semibold tracking-wide max-w-[90px] truncate">
          {displayName}
        </span>
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-neutral-900 border border-white/[0.08] shadow-2xl shadow-black/60 overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-white/[0.07]">
              <p className="text-white text-sm font-semibold truncate">{displayName}</p>
              <p className="text-white/40 text-xs truncate mt-0.5">{user.email}</p>
            </div>

            <div className="py-1.5">
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <User size={15} />
                Hồ sơ của tôi
              </Link>
              <Link
                href="/orders"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <Package size={15} />
                Đơn hàng
              </Link>
            </div>

            <div className="border-t border-white/[0.07] py-1.5">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] transition-colors"
              >
                <LogOut size={15} />
                Đăng xuất
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const totalItems = useCartStore(selectTotalItems)
  const user = useAuthStore((s: AuthState) => s.user)
  const logout = useAuthStore((s: AuthState) => s.logout)
  const { isOpen: cartOpen, toggleCart, closeCart } = useCartStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "bg-black/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 h-20 flex items-center justify-between text-white">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="https://res.cloudinary.com/dtov4zdy4/image/upload/v1773218437/ChatGPT_Image_Mar_11_2026_03_37_06_PM_1_iolztk.png"
              alt="Jumpman"
              width={100}
              height={100}
            />
          </Link>

          {/* Nav links */}
          <div className="hidden lg:flex gap-10 text-[13px] font-semibold tracking-[0.25em] uppercase">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative py-1 transition-colors duration-300 ${
                    isActive ? "text-red-500" : "text-white/70 hover:text-white"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-red-500"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="text-white/70 hover:text-red-400 transition-colors duration-300"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <button
              onClick={toggleCart}
              className="relative text-white/70 hover:text-red-400 transition-colors duration-300"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-600/40"
                >
                  {totalItems > 9 ? "9+" : totalItems}
                </motion.span>
              )}
            </button>

            <UserDropdown />

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden text-white/70 hover:text-white transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-black/95 backdrop-blur-xl border-t border-white/[0.06] overflow-hidden"
            >
              <div className="px-6 py-6 space-y-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block py-3 text-sm font-semibold tracking-[0.2em] uppercase transition-colors ${
                        isActive
                          ? "text-red-500 border-l-2 border-red-500 pl-4"
                          : "text-white/60 hover:text-white pl-4"
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                })}

                <div className="border-t border-white/[0.06] pt-4 mt-2">
                  {user ? (
                    <>
                      <p className="text-white/40 text-xs px-4 mb-2 tracking-wider uppercase">
                        {user.fullName || user.email}
                      </p>
                      <Link
                        href="/profile"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 py-3 pl-4 text-sm text-white/60 hover:text-white transition-colors"
                      >
                        <User size={15} /> Hồ sơ
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 py-3 pl-4 text-sm text-white/60 hover:text-white transition-colors"
                      >
                        <Package size={15} /> Đơn hàng
                      </Link>
                      <button
                        onClick={async () => {
                          setMobileOpen(false)
                          await logout()
                          router.push("/")
                        }}
                        className="flex items-center gap-3 py-3 pl-4 text-sm text-red-400 hover:text-red-300 transition-colors w-full"
                      >
                        <LogOut size={15} /> Đăng xuất
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 py-3 pl-4 text-sm text-white/60 hover:text-white transition-colors"
                    >
                      <User size={15} /> Đăng nhập
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <CartDrawer open={cartOpen} onClose={closeCart} />
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
