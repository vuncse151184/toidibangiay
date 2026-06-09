---
name: slug
description: "Skill for the [slug] area of toidibangiay. 16 symbols across 4 files."
---

# [slug]

16 symbols | 4 files | Cohesion: 95%

## When to Use

- Working with code in `shopify-store/`
- Understanding how buildAbsoluteUrl, buildLocaleAlternates, normalizeDescription work
- Modifying [slug]-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `shopify-store/src/lib/seo.ts` | buildAbsoluteUrl, buildLocaleAlternates, normalizeDescription, resolveMetadataImage, getMetadataImages (+7) |
| `shopify-store/src/app/(store)/products/[slug]/page.tsx` | generateMetadata, ProductDetailPage |
| `shopify-store/src/app/(store)/about/page.tsx` | AboutPage |
| `shopify-store/src/app/(store)/collections/[handle]/page.tsx` | generateMetadata |

## Entry Points

Start here when exploring this area:

- **`buildAbsoluteUrl`** (Function) — `shopify-store/src/lib/seo.ts:33`
- **`buildLocaleAlternates`** (Function) — `shopify-store/src/lib/seo.ts:37`
- **`normalizeDescription`** (Function) — `shopify-store/src/lib/seo.ts:47`
- **`resolveMetadataImage`** (Function) — `shopify-store/src/lib/seo.ts:61`
- **`getMetadataImages`** (Function) — `shopify-store/src/lib/seo.ts:73`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `buildAbsoluteUrl` | Function | `shopify-store/src/lib/seo.ts` | 33 |
| `buildLocaleAlternates` | Function | `shopify-store/src/lib/seo.ts` | 37 |
| `normalizeDescription` | Function | `shopify-store/src/lib/seo.ts` | 47 |
| `resolveMetadataImage` | Function | `shopify-store/src/lib/seo.ts` | 61 |
| `getMetadataImages` | Function | `shopify-store/src/lib/seo.ts` | 73 |
| `buildProductMetadata` | Function | `shopify-store/src/lib/seo.ts` | 134 |
| `buildCollectionMetadata` | Function | `shopify-store/src/lib/seo.ts` | 179 |
| `buildMissingPageMetadata` | Function | `shopify-store/src/lib/seo.ts` | 216 |
| `buildAboutPageSchema` | Function | `shopify-store/src/lib/seo.ts` | 274 |
| `buildBreadcrumbSchema` | Function | `shopify-store/src/lib/seo.ts` | 290 |
| `buildProductSchema` | Function | `shopify-store/src/lib/seo.ts` | 303 |
| `buildCollectionSchema` | Function | `shopify-store/src/lib/seo.ts` | 344 |
| `AboutPage` | Function | `shopify-store/src/app/(store)/about/page.tsx` | 86 |
| `generateMetadata` | Function | `shopify-store/src/app/(store)/collections/[handle]/page.tsx` | 32 |
| `generateMetadata` | Function | `shopify-store/src/app/(store)/products/[slug]/page.tsx` | 28 |
| `ProductDetailPage` | Function | `shopify-store/src/app/(store)/products/[slug]/page.tsx` | 41 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `GenerateMetadata → BuildAbsoluteUrl` | intra_community | 5 |
| `GenerateMetadata → BuildAbsoluteUrl` | intra_community | 5 |
| `CollectionDetailPage → BuildAbsoluteUrl` | cross_community | 4 |
| `RootLayout → BuildAbsoluteUrl` | cross_community | 4 |
| `ProductDetailPage → BuildAbsoluteUrl` | intra_community | 4 |
| `ShopPage → BuildAbsoluteUrl` | cross_community | 3 |
| `ProductsPage → BuildAbsoluteUrl` | cross_community | 3 |
| `GenerateMetadata → NormalizeDescription` | intra_community | 3 |
| `GenerateMetadata → BuildLocaleAlternates` | intra_community | 3 |
| `CollectionDetailPage → NormalizeDescription` | cross_community | 3 |

## How to Explore

1. `gitnexus_context({name: "buildAbsoluteUrl"})` — see callers and callees
2. `gitnexus_query({query: "[slug]"})` — find related execution flows
3. Read key files listed above for implementation details
