"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react"
import { useAuthStore, type AuthState } from "@/store/auth.store"

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const register = useAuthStore((s: AuthState) => s.register)
  const login = useAuthStore((s: AuthState) => s.login)
  const accessToken = useAuthStore((s: AuthState) => s.accessToken)
  const initialized = useAuthStore((s: AuthState) => s.initialized)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialized && accessToken) router.replace("/")
  }, [initialized, accessToken, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await register({ fullName, email, password })
      await login({ email, password })
      router.replace(searchParams.get("from") || "/")
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Đăng ký thất bại. Email này có thể đã được sử dụng.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15 }}
      className="w-full max-w-[680px]"
    >
      {/* Mobile logo */}
      <div className="lg:hidden mb-8 flex justify-center">
        <Link href="/">
          <Image
            src="/images/logo1.png"
            alt="Jumpman"
            width={80}
            height={80}
          />
        </Link>
      </div>

      <div className="mb-7">
        <h1 className="text-[22px] font-bold tracking-tight text-white">Tạo tài khoản</h1>
        <p className="mt-1.5 text-sm text-white/50">Tham gia cộng đồng sneaker Việt Nam</p>
      </div>

      {/* Form card */}
      <div
        className="rounded-3xl p-7 mb-5"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold tracking-[0.15em] text-white/50 uppercase mb-2">
              Họ và tên
            </label>
            <div className="relative">
              <User
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
              />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Nguyễn Văn A"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.07] focus:ring-1 focus:ring-red-500/20 transition-all duration-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold tracking-[0.15em] text-white/50 uppercase mb-2">
              Email
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.07] focus:ring-1 focus:ring-red-500/20 transition-all duration-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold tracking-[0.15em] text-white/50 uppercase mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Tối thiểu 8 ký tự"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-11 pr-12 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.07] focus:ring-1 focus:ring-red-500/20 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] pl-1" style={{ color: "rgba(255,255,255,0.22)" }}>
              Nên kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt.
            </p>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-400 bg-red-500/[0.08] border border-red-500/20 rounded-xl px-4 py-3"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full py-3.5 bg-red-600 text-white text-sm font-bold tracking-[0.15em] uppercase rounded-xl hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 mt-1"
            style={{ boxShadow: "0 16px 40px rgba(220,38,38,0.28)" }}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Tạo tài khoản <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </form>
      </div>

      <p className="text-center text-[11px] leading-relaxed px-2" style={{ color: "rgba(255,255,255,0.22)" }}>
        Bằng cách đăng ký, bạn đồng ý với{" "}
        <span style={{ color: "rgba(255,255,255,0.38)" }}>Điều khoản dịch vụ</span> và{" "}
        <span style={{ color: "rgba(255,255,255,0.38)" }}>Chính sách bảo mật</span>.
      </p>

      <div className="flex items-center gap-4 my-5">
        <div className="h-px flex-1 bg-white/[0.07]" />
        <span className="text-[11px] text-white/25 tracking-wider uppercase">hoặc</span>
        <div className="h-px flex-1 bg-white/[0.07]" />
      </div>

      <p className="text-center text-sm text-white/40">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-red-400 hover:text-red-300 font-semibold transition-colors">
          Đăng nhập ngay
        </Link>
      </p>

    </motion.div>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-black text-white flex overflow-hidden">

      {/* ══════════════════════════════════════
          LEFT PANEL — 35% | Branding
      ══════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col w-[25%] relative overflow-hidden">

        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 70% 55%, rgba(220,38,38,0.14), transparent 60%)" }}
          />
        </div>



        {/* SVG arc */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 900" fill="none">
          <motion.ellipse
            cx="300"
            cy="450"
            rx="270"
            ry="320"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 3, delay: 0.4 }}
          />
        </svg>

        {/* Logo — 56px */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 p-10 flex items-center"
        >
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo1.png"
              alt="Jumpman"
              width={56}
              height={56}
            />
            <div>
              <p className="text-white font-bold text-sm tracking-wide leading-none">Toidibangiay</p>
              <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mt-0.5">Sneaker chính hãng</p>
            </div>
          </Link>
        </motion.div>

        {/* Display text: Jump / man */}
        <div className="flex-1 flex items-center px-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p
              className="font-black italic text-white leading-[0.85] tracking-[0.15em]"
              style={{ fontSize: "clamp(50px, 6vw, 84px)" }}
            >
              Jump
            </p>
            <p
              className="font-black italic leading-[0.85] tracking-[0.25em] pl-5"
              style={{ fontSize: "clamp(50px, 6vw, 84px)", color: "rgba(255,255,255,0.1)" }}
            >
              man
            </p>

            <p className="mt-5 text-sm leading-[1.75] max-w-[470px]" style={{ color: "rgba(255,255,255,0.58)" }}>
              Tham gia cộng đồng sneaker Việt Nam. Mở khóa ưu đãi độc quyền và early access bộ sưu tập mới nhất.
            </p>

            {/* Benefits */}
            <ul className="mt-4 space-y-2">
              {["Chính hãng 100%", "Giao hàng toàn quốc", "Ưu đãi thành viên"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-red-500/60 flex-shrink-0" />
                  <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.42)" }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            {/* Badge */}
            <div
              className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full"
              style={{ background: "rgba(220,38,38,0.1)" }}
            >
              <span
                className="text-[10.5px] font-semibold tracking-[0.15em] uppercase"
                style={{ color: "rgba(220,38,38,0.8)" }}
              >
                Free to Join
              </span>
            </div>
          </motion.div>
        </div>

        {/* Bottom rule */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative z-10 p-10 pb-10"
        >
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-red-500/40" />
            <span className="text-[10px] text-white/20 tracking-[0.3em] uppercase">toidibangiay.vn</span>
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════
          CENTER PANEL — 30% | Hero image
      ══════════════════════════════════════ */}
      <div className="hidden lg:block w-[35%] relative overflow-hidden">

        {/* Red glow pulse */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.22, 0.44, 0.22] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute rounded-full blur-[140px] pointer-events-none"
          style={{
            width: "110%",
            height: "55%",
            top: "20%",
            left: "-5%",
            background: "radial-gradient(circle, #dc2626, transparent 70%)",
          }}
        />

        {/* Player — bottom-anchored, float animation */}
        <div className="absolute inset-0 flex items-end justify-center">
           
            <Image
              src="/images/login-poster-3.png"
              alt="Sneaker poster"
              width={600}
              height={900}
              priority
              style={{
                height: "100vh",
                width: "auto",
                objectFit: "contain",
                filter:
                  "drop-shadow(0 0 56px rgba(220,38,38,0.48)) drop-shadow(0 32px 52px rgba(0,0,0,0.95))",
              }}
            /> 
        </div>

        {/* ── Edge gradient blends ── */}
        <div
          className="absolute inset-y-0 left-0 w-[42%] pointer-events-none z-20"
          style={{ background: "linear-gradient(to right, #000000 0%, transparent 100%)" }}
        />
        <div
          className="absolute inset-y-0 right-0 w-[42%] pointer-events-none z-20"
          style={{ background: "linear-gradient(to left, #000000 0%, transparent 100%)" }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[28%] pointer-events-none z-20"
          style={{ background: "linear-gradient(to top, #000000 0%, transparent 100%)" }}
        />
        <div
          className="absolute inset-x-0 top-0 h-[12%] pointer-events-none z-20"
          style={{ background: "linear-gradient(to bottom, #000000 0%, transparent 100%)" }}
        />

        {/* Ground reflection */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 2, delay: 1.2 }}
          className="absolute z-[15]"
          style={{
            bottom: "8%",
            left: "15%",
            right: "15%",
            height: "1px",
            background: "linear-gradient(to right, transparent, rgba(220,38,38,0.4), transparent)",
          }}
        />
      </div>

      {/* ══════════════════════════════════════
          RIGHT PANEL — 35% | Register form
      ══════════════════════════════════════ */}
      <div className="flex-1 lg:flex-none lg:w-[40%] flex items-center justify-center p-6 sm:p-10 relative">
        <div
          className="absolute top-0 right-0 w-80 h-80 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(220,38,38,0.055), transparent 70%)" }}
        />
        <Suspense fallback={null}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  )
}
