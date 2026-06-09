"use client"

import { create } from "zustand"
import { backendClientFetch, clearSessionId } from "@/lib/backend-client"

export type AuthUser = {
  id: string
  email: string
  fullName?: string | null
  roles: string[]
}

export type AuthState = {
  accessToken: string | null
  user: AuthUser | null
  initialized: boolean
  setSession: (session: { accessToken: string; user?: AuthUser | null }) => void
  init: () => void
  login: (input: { email: string; password: string }) => Promise<void>
  register: (input: { fullName: string; email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
}

const ACCESS_TOKEN_KEY = "tdbg_access_token"
const USER_KEY = "tdbg_user"

// ── JWT expiry helpers (client-side, không verify signature) ─────────────────

/** Trả về expiry timestamp (ms), hoặc null nếu không decode được. */
function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return typeof payload.exp === "number" ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

/** true nếu token hết hạn hoặc không hợp lệ. */
function isTokenExpired(token: string): boolean {
  const expiry = getTokenExpiry(token)
  return expiry === null || expiry < Date.now()
}

// Timer tự clear session khi token hết hạn trong lúc đang dùng
let _expiryTimer: ReturnType<typeof setTimeout> | null = null

function scheduleExpiryCleanup(token: string) {
  if (_expiryTimer) clearTimeout(_expiryTimer)

  const expiry = getTokenExpiry(token)
  if (!expiry) return

  const delay = expiry - Date.now()
  if (delay <= 0) return

  _expiryTimer = setTimeout(() => {
    // Chỉ clear nếu vẫn đang dùng đúng token này
    const { accessToken } = useAuthStore.getState()
    if (accessToken === token) {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      useAuthStore.setState({ accessToken: null, user: null })
    }
  }, delay)
}

// ────────────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  initialized: false,

  setSession: ({ accessToken, user = null }) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ accessToken, user })
    scheduleExpiryCleanup(accessToken)
  },

  init: () => {
    if (get().initialized) return

    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)

    // Token không tồn tại hoặc đã hết hạn → clear ngay, không load user
    if (!accessToken || isTokenExpired(accessToken)) {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      set({ accessToken: null, user: null, initialized: true })
      return
    }

    const rawUser = localStorage.getItem(USER_KEY)
    const user = rawUser ? (JSON.parse(rawUser) as AuthUser) : null
    set({ accessToken, user, initialized: true })

    // Lên lịch tự clear khi token hết hạn trong lúc đang browse
    scheduleExpiryCleanup(accessToken)
  },

  login: async (input) => {
    const result = await backendClientFetch<{
      accessToken: string
      user: AuthUser
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    })

    get().setSession(result)

    // Fetch full profile to get fullName
    try {
      const profile = await backendClientFetch<AuthUser>("/auth/me", {
        accessToken: result.accessToken,
      })
      const enriched = { ...result.user, fullName: profile.fullName }
      localStorage.setItem(USER_KEY, JSON.stringify(enriched))
      set({ user: enriched })
    } catch {
      // non-fatal — fullName just won't display
    }

    // Merge guest cart then clear session id
    try {
      const { useCartStore } = await import("@/store/cart.store")
      await useCartStore.getState().mergeCart(result.accessToken)
      clearSessionId()
    } catch {
      // non-fatal
    }
  },

  register: async (input) => {
    await backendClientFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    })
  },

  logout: async () => {
    try {
      await backendClientFetch("/auth/logout", {
        method: "POST",
        accessToken: get().accessToken,
        body: JSON.stringify({}),
      })
    } finally {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      set({ accessToken: null, user: null })
    }
  },
}))
