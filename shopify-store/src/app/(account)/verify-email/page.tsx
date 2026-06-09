"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { CheckCircle, Loader2, XCircle } from "lucide-react"
import { backendClientFetch } from "@/lib/backend-client"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [state, setState] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Verifying your email...")

  useEffect(() => {
    if (!token) {
      setState("error")
      setMessage("Verification token is missing.")
      return
    }

    backendClientFetch<{ message: string }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then((result) => {
        setState("success")
        setMessage(result.message || "Email verified successfully.")
      })
      .catch((error) => {
        setState("error")
        setMessage(error instanceof Error ? error.message : "Email verification failed.")
      })
  }, [token])

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 pt-24 text-center">
      <div className="max-w-md">
        {state === "loading" && <Loader2 size={48} className="mx-auto text-red-500 mb-5 animate-spin" />}
        {state === "success" && <CheckCircle size={48} className="mx-auto text-green-500 mb-5" />}
        {state === "error" && <XCircle size={48} className="mx-auto text-red-500 mb-5" />}

        <h1 className="text-3xl font-bold font-[var(--font-display)] mb-3">
          {state === "success" ? "Email verified" : state === "error" ? "Verification failed" : "Verifying email"}
        </h1>
        <p className="text-white/45 text-sm leading-6 mb-8">{message}</p>
        <Link
          href="/"
          className="inline-flex px-5 py-3 rounded-lg bg-red-600 text-white text-xs font-bold tracking-[0.15em] uppercase"
        >
          Back to shop
        </Link>
      </div>
    </main>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  )
}
