import { create } from "zustand"
import { backendClientFetch } from "@/lib/backend-client"

export interface CartItem {
  productId: string
  variantId: string
  title: string
  variantLabel?: string
  price: number
  image?: string
  quantity: number
}

type BackendCartItem = {
  productId: string
  variantId: string
  productName: string
  variantLabel: string | null
  imageUrl: string | null
  unitPrice: string
  quantity: number
}

type BackendCart = {
  id: string
  items: BackendCartItem[]
}

export interface CartState {
  cartId?: string
  items: CartItem[]
  isOpen: boolean
  loading: boolean
  error?: string

  syncCart: (accessToken?: string | null) => Promise<void>
  addItem: (variantId: string, quantity: number, accessToken?: string | null) => Promise<void>
  removeItem: (variantId: string, accessToken?: string | null) => Promise<void>
  updateQuantity: (variantId: string, qty: number, accessToken?: string | null) => Promise<void>
  clearCart: (accessToken?: string | null) => Promise<void>
  mergeCart: (accessToken: string) => Promise<void>
  clearLocal: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
}

function mapBackendCart(cart: BackendCart): Pick<CartState, "cartId" | "items"> {
  return {
    cartId: cart.id,
    items: cart.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      title: item.productName,
      variantLabel: item.variantLabel ?? undefined,
      price: Number(item.unitPrice),
      image: item.imageUrl ?? undefined,
      quantity: item.quantity,
    })),
  }
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  loading: false,

  syncCart: async (accessToken) => {
    set({ loading: true, error: undefined })
    try {
      const cart = await backendClientFetch<BackendCart>("/cart", { accessToken })
      set({ ...mapBackendCart(cart), loading: false })
    } catch {
      set({ cartId: undefined, items: [], loading: false })
    }
  },

  addItem: async (variantId, quantity = 1, accessToken) => {
    set({ loading: true, error: undefined })
    try {
      const cart = await backendClientFetch<BackendCart>("/cart/items", {
        accessToken,
        method: "POST",
        body: JSON.stringify({ variantId, quantity }),
      })
      set({ ...mapBackendCart(cart), isOpen: true, loading: false })
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : "Failed to add item" })
      throw error
    }
  },

  removeItem: async (variantId, accessToken) => {
    set({ loading: true, error: undefined })
    try {
      const cart = await backendClientFetch<BackendCart>(
        `/cart/items/${encodeURIComponent(variantId)}`,
        { accessToken, method: "DELETE" }
      )
      set({ ...mapBackendCart(cart), loading: false })
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : "Failed to remove item" })
      throw error
    }
  },

  updateQuantity: async (variantId, qty, accessToken) => {
    if (qty <= 0) return get().removeItem(variantId, accessToken)
    set({ loading: true, error: undefined })
    try {
      const cart = await backendClientFetch<BackendCart>(
        `/cart/items/${encodeURIComponent(variantId)}`,
        { accessToken, method: "PATCH", body: JSON.stringify({ quantity: qty }) }
      )
      set({ ...mapBackendCart(cart), loading: false })
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : "Failed to update item" })
      throw error
    }
  },

  clearCart: async (accessToken) => {
    set({ loading: true, error: undefined })
    await backendClientFetch("/cart", { accessToken, method: "DELETE" })
    set({ cartId: undefined, items: [], loading: false })
  },

  mergeCart: async (accessToken) => {
    try {
      const cart = await backendClientFetch<BackendCart>("/cart/merge", {
        accessToken,
        method: "POST",
      })
      set(mapBackendCart(cart))
    } catch {
      // merge failure is non-fatal
    }
  },

  clearLocal: () => set({ cartId: undefined, items: [] }),
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
}))

export const selectTotalItems = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0)

export const selectSubtotal = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
