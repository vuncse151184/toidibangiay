"use client"

import { ApiError } from "@/lib/backend-client"

interface Props {
  error: string | ApiError | null
}

export default function ErrorBox({ error }: Props) {
  if (!error) return null

  if (error instanceof ApiError) {
    return (
      <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
            {error.statusCode}
          </span>
          <span className="text-xs font-semibold text-red-400">{error.label}</span>
        </div>
        {error.messages.length > 1 ? (
          <ul className="space-y-0.5 pl-1">
            {error.messages.map((m, i) => (
              <li key={i} className="text-xs text-red-300/80 flex items-start gap-1.5">
                <span className="mt-1 w-1 h-1 rounded-full bg-red-400/60 flex-shrink-0" />
                {m}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-red-300/80">{error.message}</p>
        )}
      </div>
    )
  }

  return (
    <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      {typeof error === "string" ? error : (error as Error).message}
    </div>
  )
}
