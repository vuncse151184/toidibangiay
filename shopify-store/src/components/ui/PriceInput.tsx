"use client"

interface Props {
  value: string
  onChange: (raw: string) => void
  className?: string
  placeholder?: string
}

export default function PriceInput({ value, onChange, className, placeholder }: Props) {
  const formatted = value ? parseInt(value, 10).toLocaleString("vi-VN") : ""

  return (
    <input
      type="text"
      inputMode="numeric"
      value={formatted}
      onChange={(e) => {
        const raw = e.target.value.replace(/\D/g, "")
        onChange(raw)
      }}
      className={className}
      placeholder={placeholder}
    />
  )
}
