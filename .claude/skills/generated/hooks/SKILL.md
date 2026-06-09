---
name: hooks
description: "Skill for the Hooks area of toidibangiay. 15 symbols across 11 files."
---

# Hooks

15 symbols | 11 files | Cohesion: 100%

## When to Use

- Working with code in `shopify-store/`
- Understanding how useCheckout, checkout, CartDrawer work
- Modifying hooks-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `shopify-store/src/hooks/useCheckout.ts` | useCheckout, checkout |
| `shopify-store/src/components/cart/CartDrawer.tsx` | formatVND, CartDrawer |
| `shopify-store/src/app/(store)/checkout/page.tsx` | CheckoutPage, handlePlaceOrder |
| `shopify-store/src/components/pages/ProductDetailClient.tsx` | formatVND, ProductDetailClient |
| `shopify-store/src/hooks/useProducts.ts` | useProducts |
| `shopify-store/src/hooks/useProduct.ts` | useProduct |
| `shopify-store/src/components/product/ProductGrid.tsx` | ProductGrid |
| `shopify-store/src/hooks/useInfiniteShowMore.ts` | useInfiniteShowMore |
| `shopify-store/src/components/product/InfiniteProductGrid.tsx` | InfiniteProductGrid |
| `shopify-store/src/hooks/useCollections.ts` | useCollections |

## Entry Points

Start here when exploring this area:

- **`useCheckout`** (Function) — `shopify-store/src/hooks/useCheckout.ts:5`
- **`checkout`** (Function) — `shopify-store/src/hooks/useCheckout.ts:11`
- **`CartDrawer`** (Function) — `shopify-store/src/components/cart/CartDrawer.tsx:13`
- **`CheckoutPage`** (Function) — `shopify-store/src/app/(store)/checkout/page.tsx:208`
- **`handlePlaceOrder`** (Function) — `shopify-store/src/app/(store)/checkout/page.tsx:231`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `useCheckout` | Function | `shopify-store/src/hooks/useCheckout.ts` | 5 |
| `checkout` | Function | `shopify-store/src/hooks/useCheckout.ts` | 11 |
| `CartDrawer` | Function | `shopify-store/src/components/cart/CartDrawer.tsx` | 13 |
| `CheckoutPage` | Function | `shopify-store/src/app/(store)/checkout/page.tsx` | 208 |
| `handlePlaceOrder` | Function | `shopify-store/src/app/(store)/checkout/page.tsx` | 231 |
| `useProducts` | Function | `shopify-store/src/hooks/useProducts.ts` | 5 |
| `useProduct` | Function | `shopify-store/src/hooks/useProduct.ts` | 5 |
| `ProductGrid` | Function | `shopify-store/src/components/product/ProductGrid.tsx` | 17 |
| `ProductDetailClient` | Function | `shopify-store/src/components/pages/ProductDetailClient.tsx` | 34 |
| `useInfiniteShowMore` | Function | `shopify-store/src/hooks/useInfiniteShowMore.ts` | 10 |
| `InfiniteProductGrid` | Function | `shopify-store/src/components/product/InfiniteProductGrid.tsx` | 18 |
| `useCollections` | Function | `shopify-store/src/hooks/useCollections.ts` | 14 |
| `CollectionsPage` | Function | `shopify-store/src/app/(store)/collections/page.tsx` | 35 |
| `formatVND` | Function | `shopify-store/src/components/cart/CartDrawer.tsx` | 9 |
| `formatVND` | Function | `shopify-store/src/components/pages/ProductDetailClient.tsx` | 30 |

## How to Explore

1. `gitnexus_context({name: "useCheckout"})` — see callers and callees
2. `gitnexus_query({query: "hooks"})` — find related execution flows
3. Read key files listed above for implementation details
