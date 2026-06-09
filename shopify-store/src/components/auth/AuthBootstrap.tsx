"use client"

import { useEffect } from "react"
import { useAuthStore, type AuthState } from "@/store/auth.store"

export function AuthBootstrap() {
  const init = useAuthStore((state: AuthState) => state.init)

  useEffect(() => {
    init()
  }, [init])

  return null
}
