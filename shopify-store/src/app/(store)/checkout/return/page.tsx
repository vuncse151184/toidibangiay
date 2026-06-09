"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useCartStore, type CartState } from "@/store/cart.store"
import { useAuthStore, type AuthState } from "@/store/auth.store"
import { getPublicBackendApiUrl } from "@/lib/backend-client"

function VnpayReturnContent() {
  const searchParams = useSearchParams()
  const responseCode = searchParams.get("vnp_ResponseCode")
  const txnRef = searchParams.get("vnp_TxnRef")
  const amount = searchParams.get("vnp_Amount")

  // vnp_ResponseCode === "00" → thành công
  const isSuccess = responseCode === "00"
  // Không có params → mock-payment hoặc truy cập thẳng
  const isMock = !responseCode

  const clearCart = useCartStore((s: CartState) => s.clearCart)
  const accessToken = useAuthStore((s: AuthState) => s.accessToken)

  useEffect(() => {
    // Nếu có VNPAY params → gọi backend để verify signature và cập nhật payment/order status
    if (!isMock) {
      const query = searchParams.toString()
      console.log("Verifying VNPay return with query:", `${getPublicBackendApiUrl()}/payments/vnpay/return?${query}`)
      fetch(`${getPublicBackendApiUrl()}/payments/vnpay/return?${query}`)
        .catch((err) => console.error("VNPay return verification failed:", err))
    }

    if (isSuccess) {
      clearCart(accessToken ?? undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const displayAmount = amount
    ? (Number(amount) / 100).toLocaleString("vi-VN") + "đ"
    : null

  if (isMock) {
    return (
      <div className="max-w-md text-center">
        <CheckCircle size={48} className="mx-auto text-green-500 mb-5" />
        <h1 className="text-3xl font-bold mb-3">Đặt hàng thành công</h1>
        <p className="text-white/45 text-sm leading-6 mb-8">
          Đơn hàng của bạn đã được ghi nhận và đang chờ xác nhận thanh toán.
        </p>
        <Link
          href="/orders"
          className="inline-flex px-5 py-3 rounded-lg bg-red-600 text-white text-xs font-bold tracking-[0.15em] uppercase hover:bg-red-500 transition-colors"
        >
          Xem đơn hàng
        </Link>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="max-w-md text-center">
        <CheckCircle size={52} className="mx-auto text-green-500 mb-5" />
        <h1 className="text-3xl font-bold mb-2">Thanh toán thành công</h1>
        {txnRef && (
          <p className="text-white/30 text-xs mb-1 font-mono">Mã GD: {txnRef}</p>
        )}
        {displayAmount && (
          <p className="text-white/50 text-sm mb-1">
            Số tiền: <span className="text-white/80">{displayAmount}</span>
          </p>
        )}
        <p className="text-white/45 text-sm leading-6 mt-3 mb-8">
          VNPAY đã xác nhận thanh toán. Đơn hàng đang được xử lý —
          bạn sẽ nhận thông báo qua email sớm nhất.
        </p>
        <Link
          href="/orders"
          className="inline-flex px-5 py-3 rounded-lg bg-red-600 text-white text-xs font-bold tracking-[0.15em] uppercase hover:bg-red-500 transition-colors"
        >
          Xem đơn hàng
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-md text-center">
      <XCircle size={52} className="mx-auto text-red-500 mb-5" />
      <h1 className="text-3xl font-bold mb-2">Thanh toán thất bại</h1>
      <p className="text-white/45 text-sm leading-6 mt-3 mb-8">
        Giao dịch không thành công (mã lỗi: {responseCode}). Vui lòng thử lại
        hoặc chọn phương thức khác.
      </p>
      <div className="flex gap-3 justify-center">
        <Link
          href="/checkout"
          className="inline-flex px-5 py-3 rounded-lg bg-red-600 text-white text-xs font-bold tracking-[0.15em] uppercase hover:bg-red-500 transition-colors"
        >
          Thử lại
        </Link>
        <Link
          href="/"
          className="inline-flex px-5 py-3 rounded-lg border border-white/10 text-white/60 text-xs font-bold tracking-[0.15em] uppercase hover:border-white/25 hover:text-white/80 transition-colors"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutReturnPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 pt-24">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={36} className="animate-spin text-white/30" />
            <p className="text-white/40 text-sm">Đang xác nhận kết quả thanh toán...</p>
          </div>
        }
      >
        <VnpayReturnContent />
      </Suspense>
    </main>
  )
}
