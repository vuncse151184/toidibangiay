import Link from "next/link"
import { XCircle } from "lucide-react"

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 pt-24 text-center">
      <div className="max-w-md">
        <XCircle size={48} className="mx-auto text-red-500 mb-5" />
        <h1 className="text-3xl font-bold font-[var(--font-display)] mb-3">Payment cancelled</h1>
        <p className="text-white/45 text-sm leading-6 mb-8">
          Your cart was kept unchanged. You can review your items and try checkout again.
        </p>
        <Link
          href="/checkout"
          className="inline-flex px-5 py-3 rounded-lg bg-red-600 text-white text-xs font-bold tracking-[0.15em] uppercase"
        >
          Back to checkout
        </Link>
      </div>
    </main>
  )
}
