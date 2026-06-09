---
name: app
description: "Skill for the App area of toidibangiay. 8 symbols across 6 files."
---

# App

8 symbols | 6 files | Cohesion: 93%

## When to Use

- Working with code in `shopify-store/`
- Understanding how cn, buildOrganizationSchema, RootLayout work
- Modifying app-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `shopify-store/src/lib/seo.ts` | buildOrganizationSchema, buildHomePageSchema |
| `shopify-store/src/app/providers.tsx` | makeQueryClient, Providers |
| `shopify-store/src/lib/utils.ts` | cn |
| `shopify-store/src/app/layout.tsx` | RootLayout |
| `shopify-store/src/components/ui/button.tsx` | Button |
| `shopify-store/src/app/page.tsx` | Home |

## Entry Points

Start here when exploring this area:

- **`cn`** (Function) — `shopify-store/src/lib/utils.ts:3`
- **`buildOrganizationSchema`** (Function) — `shopify-store/src/lib/seo.ts:228`
- **`RootLayout`** (Function) — `shopify-store/src/app/layout.tsx:22`
- **`buildHomePageSchema`** (Function) — `shopify-store/src/lib/seo.ts:259`
- **`Home`** (Function) — `shopify-store/src/app/page.tsx:43`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `cn` | Function | `shopify-store/src/lib/utils.ts` | 3 |
| `buildOrganizationSchema` | Function | `shopify-store/src/lib/seo.ts` | 228 |
| `RootLayout` | Function | `shopify-store/src/app/layout.tsx` | 22 |
| `buildHomePageSchema` | Function | `shopify-store/src/lib/seo.ts` | 259 |
| `Home` | Function | `shopify-store/src/app/page.tsx` | 43 |
| `Providers` | Function | `shopify-store/src/app/providers.tsx` | 23 |
| `Button` | Function | `shopify-store/src/components/ui/button.tsx` | 43 |
| `makeQueryClient` | Function | `shopify-store/src/app/providers.tsx` | 6 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `RootLayout → BuildAbsoluteUrl` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| [slug] | 1 calls |

## How to Explore

1. `gitnexus_context({name: "cn"})` — see callers and callees
2. `gitnexus_query({query: "app"})` — find related execution flows
3. Read key files listed above for implementation details
