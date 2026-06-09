"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Truck, CheckCircle, ShoppingBag, Lock, Loader2, CreditCard } from "lucide-react"
import { useCartStore, selectSubtotal, selectTotalItems, type CartItem, type CartState } from "@/store/cart.store"
import { useCheckout } from "@/hooks/useCheckout"

type Step = "shipping" | "review"

const STEPS: { key: Step; label: string; icon: typeof Truck }[] = [
  { key: "shipping", label: "Giao hàng", icon: Truck },
  { key: "review", label: "Xác nhận", icon: CheckCircle },
]

const formatVND = (amount: number) => amount.toLocaleString("vi-VN") + "đ"

function StepIndicator({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current)

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 mb-10">
      {STEPS.map((step, i) => {
        const Icon = step.icon
        const isActive = i === currentIndex
        const isDone = i < currentIndex

        return (
          <div key={step.key} className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isActive
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                    : isDone
                    ? "bg-red-600/20 text-red-500"
                    : "bg-white/[0.06] text-white/30"
                }`}
              >
                {isDone ? <CheckCircle size={16} /> : <Icon size={16} />}
              </div>
              <span
                className={`text-xs font-semibold tracking-wider uppercase hidden sm:block ${
                  isActive ? "text-white" : isDone ? "text-red-500/70" : "text-white/30"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-8 md:w-16 h-px transition-colors duration-500 ${
                  isDone ? "bg-red-500/40" : "bg-white/[0.08]"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function InputField({
  label,
  placeholder,
  type = "text",
  half = false,
  value,
  onChange,
}: {
  label: string
  placeholder: string
  type?: string
  half?: boolean
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className={half ? "flex-1" : "w-full"}>
      <label className="block text-xs text-white/40 font-semibold tracking-wider uppercase mb-2">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.06] transition-all duration-300"
      />
    </div>
  )
}

type ShippingInfo = {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  district: string
  note: string
}

function ShippingForm({
  info,
  onChange,
}: {
  info: ShippingInfo
  onChange: (field: keyof ShippingInfo, value: string) => void
}) {
  return (
    <motion.div
      key="shipping"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-5"
    >
      <h2 className="text-xl font-bold font-[var(--font-display)] tracking-wider text-white mb-6">
        Thông tin giao hàng
      </h2>

      <InputField
        label="Họ và tên"
        placeholder="Nguyễn Văn A"
        value={info.fullName}
        onChange={(v) => onChange("fullName", v)}
      />
      <div className="flex gap-4">
        <InputField
          label="Email"
          placeholder="email@example.com"
          type="email"
          half
          value={info.email}
          onChange={(v) => onChange("email", v)}
        />
        <InputField
          label="Số điện thoại"
          placeholder="0901 234 567"
          type="tel"
          half
          value={info.phone}
          onChange={(v) => onChange("phone", v)}
        />
      </div>
      <InputField
        label="Địa chỉ"
        placeholder="Số nhà, tên đường, phường/xã"
        value={info.address}
        onChange={(v) => onChange("address", v)}
      />
      <div className="flex gap-4">
        <InputField
          label="Tỉnh / Thành phố"
          placeholder="TP. Hồ Chí Minh"
          half
          value={info.city}
          onChange={(v) => onChange("city", v)}
        />
        <InputField
          label="Quận / Huyện"
          placeholder="Quận 1"
          half
          value={info.district}
          onChange={(v) => onChange("district", v)}
        />
      </div>
      <div className="w-full">
        <label className="block text-xs text-white/40 font-semibold tracking-wider uppercase mb-2">
          Ghi chú{" "}
          <span className="text-white/20 normal-case tracking-normal font-normal">(tùy chọn)</span>
        </label>
        <textarea
          placeholder="Ghi chú thêm cho đơn hàng (thời gian giao hàng, yêu cầu đặc biệt...)"
          rows={3}
          value={info.note}
          onChange={(e) => onChange("note", e.target.value)}
          className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.06] transition-all duration-300 resize-none"
        />
      </div>
    </motion.div>
  )
}

function ReviewStep({ shipping }: { shipping: ShippingInfo }) {
  const items: CartItem[] = useCartStore((s: CartState) => s.items)
  const subtotal = useCartStore(selectSubtotal)

  return (
    <motion.div
      key="review"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-bold font-[var(--font-display)] tracking-wider text-white mb-6">
        Xác nhận đơn hàng
      </h2>

      {/* Shipping summary */}
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
        <p className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-3">
          Địa chỉ giao hàng
        </p>
        <p className="text-sm text-white/80">{shipping.fullName || "—"}</p>
        <p className="text-sm text-white/50">{shipping.phone || "—"}</p>
        <p className="text-sm text-white/50">
          {[shipping.address, shipping.district, shipping.city].filter(Boolean).join(", ") || "—"}
        </p>
        {shipping.note && (
          <p className="text-xs text-white/30 italic mt-1">Ghi chú: {shipping.note}</p>
        )}
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
          >
            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
              {item.image ? (
                <Image src={item.image} alt={item.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/10">
                  <ShoppingBag size={16} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/80 truncate">{item.title}</p>
              {item.variantLabel && (
                <p className="text-xs text-white/30">{item.variantLabel}</p>
              )}
              <p className="text-xs text-white/40">Số lượng: {item.quantity}</p>
            </div>
            <p className="text-sm font-bold text-white font-[var(--font-display)]">
              {formatVND(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-white/[0.06] pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/40">Tạm tính</span>
          <span className="text-white/70">{formatVND(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/40">Phí vận chuyển</span>
          <span className="text-green-500 font-medium">Miễn phí</span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-3 border-t border-white/[0.06]">
          <span className="text-white">Tổng cộng</span>
          <span className="text-red-500 font-[var(--font-display)]">{formatVND(subtotal)}</span>
        </div>
      </div>

      {/* Payment method badge */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
          <CreditCard size={18} className="text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Thanh toán qua VNPAY</p>
          <p className="text-xs text-white/40 mt-0.5">
            Hỗ trợ thẻ ATM, Visa, MasterCard, QR Code
          </p>
        </div>
      </div>
    </motion.div>
  )
}

const EMPTY_SHIPPING: ShippingInfo = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  district: "",
  note: "",
}

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>("shipping")
  const [shipping, setShipping] = useState<ShippingInfo>(EMPTY_SHIPPING)

  const items: CartItem[] = useCartStore((s: CartState) => s.items)
  const totalItems = useCartStore(selectTotalItems)
  const subtotal = useCartStore(selectSubtotal)
  const { checkout, loading: checkoutLoading, error: checkoutError } = useCheckout()

  const stepIndex = STEPS.findIndex((s) => s.key === step)

  const handleShippingChange = (field: keyof ShippingInfo, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }))
  }

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1].key)
  }

  const goBack = () => {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1].key)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6">
        <ShoppingBag size={48} className="text-white/10 mb-4" />
        <p className="text-white/50 text-lg font-bold mb-2">Giỏ hàng trống</p>
        <p className="text-white/30 text-sm mb-8">Thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-red-500 text-xs font-bold tracking-wider uppercase hover:text-red-400 transition-colors"
        >
          <ArrowLeft size={14} />
          Tiếp tục mua sắm
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_70%_10%,rgba(220,38,38,0.12),transparent_60%)]" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-8 pt-28 pb-20">
        {/* Back */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/40 text-xs font-medium tracking-wider uppercase hover:text-white/70 transition-colors"
          >
            <ArrowLeft size={14} />
            Quay lại cửa hàng
          </Link>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold font-[var(--font-display)] tracking-tight text-white text-center mb-8"
        >
          Thanh toán
        </motion.h1>

        <StepIndicator current={step} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 md:p-8">
              <AnimatePresence mode="wait">
                {step === "shipping" && (
                  <ShippingForm info={shipping} onChange={handleShippingChange} />
                )}
                {step === "review" && <ReviewStep shipping={shipping} />}
              </AnimatePresence>

              {checkoutError && (
                <div className="mt-4 p-3 rounded-lg bg-red-600/10 border border-red-600/20 text-red-400 text-sm">
                  {checkoutError}
                </div>
              )}

              <div className="flex gap-4 mt-8">
                {stepIndex > 0 && (
                  <button
                    onClick={goBack}
                    disabled={checkoutLoading}
                    className="flex-1 py-4 rounded-lg text-sm font-bold tracking-[0.15em] uppercase border border-white/[0.15] text-white hover:bg-white/[0.03] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Quay lại
                  </button>
                )}

                {step === "review" ? (
                  <button
                    onClick={() => checkout()}
                    disabled={checkoutLoading}
                    className="flex-1 py-4 rounded-lg text-sm font-bold tracking-[0.15em] uppercase transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/20"
                  >
                    {checkoutLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Lock size={14} />
                        Thanh toán  
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={goNext}
                    className="flex-1 py-4 rounded-lg text-sm font-bold tracking-[0.15em] uppercase transition-all duration-300 bg-white text-black hover:bg-white/90"
                  >
                    Tiếp tục
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Order summary sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 sticky top-28">
              <h3 className="text-sm font-bold tracking-[0.2em] text-white/60 uppercase mb-5">
                Đơn hàng của bạn
              </h3>

              <div className="space-y-3 max-h-[240px] overflow-y-auto mb-5 pr-1">
                {items.map((item) => (
                  <div key={item.variantId} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
                      {item.image ? (
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/10">
                          <ShoppingBag size={14} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/70 truncate">{item.title}</p>
                      {item.variantLabel && (
                        <p className="text-[11px] text-white/25">{item.variantLabel}</p>
                      )}
                      <p className="text-[11px] text-white/30">×{item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-white/80 whitespace-nowrap">
                      {formatVND(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/[0.06] pt-4 space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40 tracking-wider uppercase">
                    Sản phẩm ({totalItems})
                  </span>
                  <span className="text-white/70">{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40 tracking-wider uppercase">Vận chuyển</span>
                  <span className="text-green-500">Miễn phí</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-3 border-t border-white/[0.06]">
                  <span className="text-white uppercase tracking-wider text-sm">Tổng cộng</span>
                  <span className="text-red-500 font-[var(--font-display)] text-lg">
                    {formatVND(subtotal)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-white/20">
                <Lock size={12} />
                <span className="text-[11px] tracking-wide">Thanh toán bảo mật qua VNPAY</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
