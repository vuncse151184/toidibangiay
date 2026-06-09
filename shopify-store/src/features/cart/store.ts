import { create } from "zustand"

type CartItem = {
  variantId: string
  quantity: number
}

type CartState = {
  items: CartItem[]
  addItem: (item: CartItem) => void
}

export const useCartStore = create<CartState>((set) => ({
  items: [],

  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item]
    }))
}))