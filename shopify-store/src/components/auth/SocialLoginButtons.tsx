"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useGoogleLogin } from "@react-oauth/google"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { useAuthStore, type AuthState } from "@/store/auth.store"

// ── Facebook SDK types ────────────────────────────────────────────────────────
declare global {
  interface Window {
    FB: {
      init: (params: { appId: string; version: string; xfbml?: boolean; cookie?: boolean }) => void
      login: (
        callback: (response: {
          authResponse?: { accessToken: string; userID: string } | null
          status?: string
        }) => void,
        params?: { scope: string },
      ) => void
    }
    fbAsyncInit: () => void
  }
}

const FB_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? ""

// ── Google icon ───────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

// ── Facebook icon ─────────────────────────────────────────────────────────────
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  redirectTo?: string
}

export default function SocialLoginButtons({ redirectTo = "/" }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const socialLogin = useAuthStore((s: AuthState) => s.socialLogin)

  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [loadingFacebook, setLoadingFacebook] = useState(false)
  const [error, setError] = useState("")
  const [isHttps, setIsHttps] = useState(false)
  const fbInited = useRef(false)

  const dest = searchParams.get("from") || redirectTo

  useEffect(() => {
    setIsHttps(window.location.protocol === "https:")
  }, [])

  // Load Facebook SDK only on HTTPS (FB.login is blocked on HTTP)
  useEffect(() => {
    if (!FB_APP_ID || !isHttps) return

    const initFB = () => {
      window.FB.init({ appId: FB_APP_ID, version: "v20.0", cookie: true, xfbml: false })
      fbInited.current = true
    }

    // SDK already loaded (cached or previous component mount)
    if (window.FB) {
      initFB()
      return
    }

    window.fbAsyncInit = initFB

    // Avoid injecting duplicate script tag
    if (!document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script")
      script.id = "facebook-jssdk"
      script.src = "https://connect.facebook.net/en_US/sdk.js"
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }
  }, [isHttps])

  const handleOAuth = useCallback(
    async (provider: "google" | "facebook", token: string) => {
      try {
        await socialLogin({ provider, token })
        router.replace(dest)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : `Đăng nhập ${provider === "google" ? "Google" : "Facebook"} thất bại`,
        )
      }
    },
    [socialLogin, router, dest],
  )

  // Google login via @react-oauth/google (returns access_token → backend verifies via userinfo)
  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError("")
      await handleOAuth("google", tokenResponse.access_token)
      setLoadingGoogle(false)
    },
    onError: () => {
      setError("Đăng nhập Google thất bại")
      setLoadingGoogle(false)
    },
  })

  const handleGoogleClick = () => {
    setError("")
    setLoadingGoogle(true)
    loginGoogle()
  }

  const handleFacebookClick = () => {
    if (!FB_APP_ID) {
      setError("Facebook chưa được cấu hình — thêm NEXT_PUBLIC_FACEBOOK_APP_ID vào .env")
      return
    }
    if (!window.FB || !fbInited.current) {
      setError("Facebook SDK chưa sẵn sàng — thử lại sau vài giây")
      return
    }
    setError("")
    setLoadingFacebook(true)
    window.FB.login(
      (response) => {
        if (response.authResponse?.accessToken) {
          handleOAuth("facebook", response.authResponse.accessToken).finally(() => {
            setLoadingFacebook(false)
          })
        } else {
          setError("Đăng nhập Facebook bị huỷ hoặc thất bại")
          setLoadingFacebook(false)
        }
      },
      { scope: "email,public_profile" },
    )
  }

  return (
    <div className="space-y-3">
      {/* Google */}
      <motion.button
        type="button"
        onClick={handleGoogleClick}
        disabled={loadingGoogle || loadingFacebook}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.07] text-white/80 hover:text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loadingGoogle ? (
          <span className="w-[18px] h-[18px] border-2 border-white/20 border-t-white/70 rounded-full animate-spin flex-shrink-0" />
        ) : (
          <GoogleIcon />
        )}
        <span>Tiếp tục với Google</span>
      </motion.button>

      {/* Facebook — chỉ render khi đã cấu hình App ID và đang chạy trên HTTPS */}
      {FB_APP_ID && isHttps && (
        <motion.button
          type="button"
          onClick={handleFacebookClick}
          disabled={loadingGoogle || loadingFacebook}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.07] text-white/80 hover:text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingFacebook ? (
            <span className="w-[18px] h-[18px] border-2 border-white/20 border-t-blue-400 rounded-full animate-spin flex-shrink-0" />
          ) : (
            <FacebookIcon />
          )}
          <span>Tiếp tục với Facebook</span>
        </motion.button>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400 bg-red-500/[0.08] border border-red-500/20 rounded-xl px-4 py-3 text-center"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
