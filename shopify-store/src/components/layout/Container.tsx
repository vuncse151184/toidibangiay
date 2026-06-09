import { ReactNode } from "react"

export default function Container({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-8">
      {children}
    </div>
  )
}
