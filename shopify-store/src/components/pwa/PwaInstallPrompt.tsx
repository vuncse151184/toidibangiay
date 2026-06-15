"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function PwaInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Don't show if already installed (running as standalone PWA)
    if (window.matchMedia("(display-mode: standalone)").matches) return

    // Don't show if user already dismissed in this session
    if (sessionStorage.getItem("pwa-prompt-dismissed")) return

    const handler = (e: Event) => {
      e.preventDefault()
      setPromptEvent(e as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!promptEvent) return
    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    if (outcome === "accepted") setPromptEvent(null)
  }

  const handleDismiss = () => {
    sessionStorage.setItem("pwa-prompt-dismissed", "1")
    setDismissed(true)
  }

  if (!promptEvent || dismissed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-80">
      <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-neutral-900 p-4 shadow-2xl shadow-black/50">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-600">
          <Download size={18} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Cài đặt ứng dụng</p>
          <p className="mt-0.5 text-xs text-white/50">
            Thêm toidibangiay vào màn hình chính để truy cập nhanh hơn
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 rounded-lg bg-red-600 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-500"
            >
              Cài đặt
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 rounded-lg bg-white/[0.06] py-1.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/10"
            >
              Để sau
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-white/30 transition-colors hover:text-white/60"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
