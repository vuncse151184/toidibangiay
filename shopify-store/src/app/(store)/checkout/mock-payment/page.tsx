"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CreditCard, X, ShieldCheck } from "lucide-react"

function MockPaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const orderId = searchParams.get("orderId") ?? "unknown"
  const amount = searchParams.get("amount")
  const method = searchParams.get("method") ?? "VNPAY"

  const displayAmount = amount
    ? Number(amount).toLocaleString("vi-VN") + "đ"
    : "—"

  const handlePay = () => {
    // Giả lập VNPAY redirect về return URL với vnp_ResponseCode=00
    const params = new URLSearchParams({
      vnp_ResponseCode: "00",
      vnp_TxnRef: `mock-${orderId}`,
      vnp_Amount: String(Number(amount ?? 0) * 100),
      vnp_TransactionNo: `mock${Date.now()}`,
      vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
    })
    router.push(`/checkout/return?${params.toString()}`)
  }

  const handleCancel = () => {
    router.push("/checkout")
  }

  return (
    <div className="w-full max-w-sm">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
          <span className="text-[11px] text-yellow-400 font-semibold tracking-[0.15em] uppercase">
            Môi trường dev — Thanh toán giả lập
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">Cổng thanh toán {method}</h1>
        <p className="mt-1 text-sm text-white/40">
          Trang này chỉ xuất hiện khi chưa cấu hình credentials thật
        </p>
      </div>

      {/* Order summary card */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center flex-shrink-0">
            <CreditCard size={18} className="text-red-400" />
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-[0.12em]">Phương thức</p>
            <p className="text-sm font-semibold text-white">{method}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-white/40">Mã đơn hàng</span>
            <span className="text-white/70 font-mono text-xs">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Số tiền</span>
            <span className="text-white font-bold text-base">{displayAmount}</span>
          </div>
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-start gap-2 mb-6 px-1">
        <ShieldCheck size={14} className="text-white/25 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-white/25 leading-relaxed">
          Đây là trang giả lập. Production sẽ redirect thẳng tới cổng {method} thật.
          Nhấn <strong className="text-white/40">Thanh toán</strong> để mô phỏng thành công.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleCancel}
          className="flex items-center justify-center gap-1.5 flex-1 py-3.5 rounded-xl border border-white/[0.08] text-white/50 text-sm font-semibold hover:border-white/20 hover:text-white/70 transition-all duration-200"
        >
          <X size={15} />
          Huỷ
        </button>
        <button
          onClick={handlePay}
          className="flex items-center justify-center gap-2 flex-[2] py-3.5 rounded-xl bg-red-600 text-white text-sm font-bold tracking-[0.1em] uppercase hover:bg-red-500 transition-all duration-200"
          style={{ boxShadow: "0 12px 32px rgba(220,38,38,0.25)" }}
        >
          <CreditCard size={15} />
          Thanh toán {displayAmount}
        </button>
      </div>
    </div>
  )
}

export default function MockPaymentPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 pt-20">
      <Suspense fallback={
        <div className="text-white/30 text-sm">Đang tải...</div>
      }>
        <MockPaymentContent />
      </Suspense>
    </main>
  )
}
