"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuthStore, type AuthState } from "@/store/auth.store"
import AdminSidebar from "./_components/AdminSidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s: AuthState) => s.user)
  const initialized = useAuthStore((s: AuthState) => s.initialized)
  const pathname = usePathname()
  const router = useRouter()

  const isLoginPage = pathname === "/admin/login"

  useEffect(() => {
    if (isLoginPage || !initialized) return
    const isAdmin = user?.roles?.includes("admin") || user?.roles?.includes("ADMIN")
    if (!isAdmin) {
      router.replace("/admin/login")
    }
  }, [isLoginPage, initialized, user, router])

  // Login page renders without sidebar or auth guard
  if (isLoginPage) return <>{children}</>

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
      <AdminSidebar />
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  )
}
