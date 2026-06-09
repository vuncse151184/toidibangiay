---
name: pages
description: "Skill for the Pages area of toidibangiay. 4 symbols across 2 files."
---

# Pages

4 symbols | 2 files | Cohesion: 100%

## When to Use

- Working with code in `shopify-store/`
- Understanding how handleLoadMore, handleLoadMore work
- Modifying pages-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `shopify-store/src/components/pages/ShopCatalogClient.tsx` | fetchProductsPage, handleLoadMore |
| `shopify-store/src/components/pages/CollectionDetailClient.tsx` | fetchCollectionPage, handleLoadMore |

## Entry Points

Start here when exploring this area:

- **`handleLoadMore`** (Function) — `shopify-store/src/components/pages/ShopCatalogClient.tsx:51`
- **`handleLoadMore`** (Function) — `shopify-store/src/components/pages/CollectionDetailClient.tsx:49`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `handleLoadMore` | Function | `shopify-store/src/components/pages/ShopCatalogClient.tsx` | 51 |
| `handleLoadMore` | Function | `shopify-store/src/components/pages/CollectionDetailClient.tsx` | 49 |
| `fetchProductsPage` | Function | `shopify-store/src/components/pages/ShopCatalogClient.tsx` | 24 |
| `fetchCollectionPage` | Function | `shopify-store/src/components/pages/CollectionDetailClient.tsx` | 19 |

## How to Explore

1. `gitnexus_context({name: "handleLoadMore"})` — see callers and callees
2. `gitnexus_query({query: "pages"})` — find related execution flows
3. Read key files listed above for implementation details
