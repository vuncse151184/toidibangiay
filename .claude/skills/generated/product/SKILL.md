---
name: product
description: "Skill for the Product area of toidibangiay. 20 symbols across 5 files."
---

# Product

20 symbols | 5 files | Cohesion: 100%

## When to Use

- Working with code in `shopify-store/`
- Understanding how VariantSelector, findVariant, handleChange work
- Modifying product-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `shopify-store/src/components/product/VariantSelector.tsx` | formatVND, parseVariantOptions, VariantSelector, findVariant, handleChange (+6) |
| `shopify-store/src/components/product/ShoeFilter.tsx` | getVariantSizes, applyFilters, ShoeFilter, updateFilter, toggleSize |
| `shopify-store/src/components/product/ProductCard.tsx` | formatVND, ProductCard |
| `shopify-store/src/components/pages/ShopCatalogClient.tsx` | ShopCatalogClient |
| `shopify-store/src/components/pages/CollectionDetailClient.tsx` | CollectionDetailClient |

## Entry Points

Start here when exploring this area:

- **`VariantSelector`** (Function) — `shopify-store/src/components/product/VariantSelector.tsx:38`
- **`findVariant`** (Function) — `shopify-store/src/components/product/VariantSelector.tsx:57`
- **`handleChange`** (Function) — `shopify-store/src/components/product/VariantSelector.tsx:67`
- **`getSizesForColor`** (Function) — `shopify-store/src/components/product/VariantSelector.tsx:75`
- **`getGendersForColorSize`** (Function) — `shopify-store/src/components/product/VariantSelector.tsx:80`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `VariantSelector` | Function | `shopify-store/src/components/product/VariantSelector.tsx` | 38 |
| `findVariant` | Function | `shopify-store/src/components/product/VariantSelector.tsx` | 57 |
| `handleChange` | Function | `shopify-store/src/components/product/VariantSelector.tsx` | 67 |
| `getSizesForColor` | Function | `shopify-store/src/components/product/VariantSelector.tsx` | 75 |
| `getGendersForColorSize` | Function | `shopify-store/src/components/product/VariantSelector.tsx` | 80 |
| `isColorSoldOut` | Function | `shopify-store/src/components/product/VariantSelector.tsx` | 87 |
| `isSizeSoldOut` | Function | `shopify-store/src/components/product/VariantSelector.tsx` | 93 |
| `isGenderSoldOut` | Function | `shopify-store/src/components/product/VariantSelector.tsx` | 99 |
| `getPriceForColor` | Function | `shopify-store/src/components/product/VariantSelector.tsx` | 107 |
| `applyFilters` | Function | `shopify-store/src/components/product/ShoeFilter.tsx` | 269 |
| `ShopCatalogClient` | Function | `shopify-store/src/components/pages/ShopCatalogClient.tsx` | 36 |
| `CollectionDetailClient` | Function | `shopify-store/src/components/pages/CollectionDetailClient.tsx` | 31 |
| `ShoeFilter` | Function | `shopify-store/src/components/product/ShoeFilter.tsx` | 78 |
| `updateFilter` | Function | `shopify-store/src/components/product/ShoeFilter.tsx` | 86 |
| `toggleSize` | Function | `shopify-store/src/components/product/ShoeFilter.tsx` | 90 |
| `ProductCard` | Function | `shopify-store/src/components/product/ProductCard.tsx` | 14 |
| `formatVND` | Function | `shopify-store/src/components/product/VariantSelector.tsx` | 12 |
| `parseVariantOptions` | Function | `shopify-store/src/components/product/VariantSelector.tsx` | 20 |
| `getVariantSizes` | Function | `shopify-store/src/components/product/ShoeFilter.tsx` | 258 |
| `formatVND` | Function | `shopify-store/src/components/product/ProductCard.tsx` | 10 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `ShopCatalogClient → GetVariantSizes` | intra_community | 3 |
| `CollectionDetailClient → GetVariantSizes` | intra_community | 3 |
| `ShoeFilter → UpdateFilter` | intra_community | 3 |

## How to Explore

1. `gitnexus_context({name: "VariantSelector"})` — see callers and callees
2. `gitnexus_query({query: "product"})` — find related execution flows
3. Read key files listed above for implementation details
