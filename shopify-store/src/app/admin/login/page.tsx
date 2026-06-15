"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react"
import { useAuthStore, type AuthState } from "@/store/auth.store"

export default function AdminLoginPage() {
  const router = useRouter()
  const login = useAuthStore((s: AuthState) => s.login)
  const user = useAuthStore((s: AuthState) => s.user)
  const initialized = useAuthStore((s: AuthState) => s.initialized)

  const [email, setEmail] = useState("admin@toidibangiay.vn")
  const [password, setPassword] = useState("Admin@123456")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!initialized) return
    const isAdmin = user?.roles?.includes("admin") || user?.roles?.includes("ADMIN")
    if (isAdmin) router.replace("/admin")
  }, [initialized, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login({ email, password })
      const roles = useAuthStore.getState().user?.roles ?? []
      const isAdmin = roles.includes("admin") || roles.includes("ADMIN")
      if (!isAdmin) {
        useAuthStore.getState().logout()
        setError("Tài khoản không có quyền truy cập admin.")
        return
      }
      router.replace("/admin")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại")
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="text-white font-bold text-sm tracking-wider uppercase">toidibangiay</span>
            <span className="text-[10px] text-red-500 font-bold tracking-widest bg-red-500/10 px-1.5 py-0.5 rounded">
              ADMIN
            </span>
          </div>
          <h1 className="text-xl font-bold text-white">Đăng nhập quản trị</h1>
          <p className="mt-1 text-xs text-white/30">Chỉ dành cho tài khoản có quyền admin</p>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] text-white/40 uppercase tracking-widest mb-2">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                  autoComplete="email"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-white/40 uppercase tracking-widest mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`${inputCls} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/[0.08] border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Vào trang quản trị <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/20">
          <a href="/" className="hover:text-white/50 transition-colors">
            ← Về trang chủ
          </a>
        </p>
      </div>
    </div>
  )
}
