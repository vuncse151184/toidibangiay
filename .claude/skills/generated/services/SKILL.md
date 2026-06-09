---
name: services
description: "Skill for the Services area of toidibangiay. 50 symbols across 21 files."
---

# Services

50 symbols | 21 files | Cohesion: 85%

## When to Use

- Working with code in `shopify-store/`
- Understanding how getProductByHandle, createBackendCheckout, getBackendApiBaseUrl work
- Modifying services-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `shopify-store/src/services/product.service.ts` | mapProduct, getProductByHandle, normalizeProductsResponse, fetchBackendProducts, getProducts (+2) |
| `shopify-store/src/services/collection.service.ts` | getCategoryHandle, mapCollection, getBackendCategories, getCollections, mapPageInfo (+2) |
| `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/infrastructure/services/redis-login-rate-limit.service.ts` | assertNotRateLimited, registerFailure, reset, emailKey, ipKey (+1) |
| `backend/services/user-service/src/modules/auth/infrastructure/services/redis-login-rate-limit.service.ts` | assertNotRateLimited, registerFailure, reset, emailKey, ipKey (+1) |
| `backend/services/auth-service/src/modules/auth/infrastructure/services/redis-rate-limit.service.ts` | emailKey, ipKey, assertNotRateLimited, registerFailure, reset (+1) |
| `shopify-store/src/services/backend-api.service.ts` | getBackendApiBaseUrl, backendFetch |
| `shopify-store/src/app/(store)/collections/[handle]/page.tsx` | generateStaticParams, CollectionDetailPage |
| `shopify-store/src/services/cart.service.ts` | createBackendCheckout |
| `shopify-store/src/app/api/products/[handle]/route.ts` | GET |
| `shopify-store/src/app/api/cart/checkout/route.ts` | POST |

## Entry Points

Start here when exploring this area:

- **`getProductByHandle`** (Function) — `shopify-store/src/services/product.service.ts:84`
- **`createBackendCheckout`** (Function) — `shopify-store/src/services/cart.service.ts:19`
- **`getBackendApiBaseUrl`** (Function) — `shopify-store/src/services/backend-api.service.ts:43`
- **`backendFetch`** (Function) — `shopify-store/src/services/backend-api.service.ts:51`
- **`GET`** (Function) — `shopify-store/src/app/api/products/[handle]/route.ts:3`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `RedisLoginRateLimitService` | Class | `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/infrastructure/services/redis-login-rate-limit.service.ts` | 15 |
| `RedisLoginRateLimitService` | Class | `backend/services/user-service/src/modules/auth/infrastructure/services/redis-login-rate-limit.service.ts` | 15 |
| `RedisRateLimitService` | Class | `backend/services/auth-service/src/modules/auth/infrastructure/services/redis-rate-limit.service.ts` | 11 |
| `getProductByHandle` | Function | `shopify-store/src/services/product.service.ts` | 84 |
| `createBackendCheckout` | Function | `shopify-store/src/services/cart.service.ts` | 19 |
| `getBackendApiBaseUrl` | Function | `shopify-store/src/services/backend-api.service.ts` | 43 |
| `backendFetch` | Function | `shopify-store/src/services/backend-api.service.ts` | 51 |
| `GET` | Function | `shopify-store/src/app/api/products/[handle]/route.ts` | 3 |
| `POST` | Function | `shopify-store/src/app/api/cart/checkout/route.ts` | 3 |
| `getProducts` | Function | `shopify-store/src/services/product.service.ts` | 79 |
| `sitemap` | Function | `shopify-store/src/app/sitemap.ts` | 5 |
| `GET` | Function | `shopify-store/src/app/api/products/route.ts` | 3 |
| `generateStaticParams` | Function | `shopify-store/src/app/(store)/products/[slug]/page.tsx` | 19 |
| `getCollections` | Function | `shopify-store/src/services/collection.service.ts` | 50 |
| `GET` | Function | `shopify-store/src/app/api/collections/route.ts` | 3 |
| `generateStaticParams` | Function | `shopify-store/src/app/(store)/collections/[handle]/page.tsx` | 23 |
| `getProductsPage` | Function | `shopify-store/src/services/product.service.ts` | 63 |
| `buildProductListSchema` | Function | `shopify-store/src/lib/seo.ts` | 374 |
| `ShopPage` | Function | `shopify-store/src/app/(store)/shop/page.tsx` | 37 |
| `ProductsPage` | Function | `shopify-store/src/app/(store)/products/page.tsx` | 37 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `GET → GetBackendApiBaseUrl` | cross_community | 7 |
| `CollectionDetailPage → GetBackendApiBaseUrl` | cross_community | 7 |
| `GET → NormalizeProductsResponse` | cross_community | 6 |
| `CollectionDetailPage → NormalizeProductsResponse` | cross_community | 6 |
| `Sitemap → GetBackendApiBaseUrl` | cross_community | 6 |
| `GET → GetBackendApiBaseUrl` | cross_community | 6 |
| `GenerateStaticParams → GetBackendApiBaseUrl` | cross_community | 6 |
| `GET → GetBackendApiBaseUrl` | cross_community | 5 |
| `ShopPage → GetBackendApiBaseUrl` | cross_community | 5 |
| `ProductsPage → GetBackendApiBaseUrl` | cross_community | 5 |

## Connected Areas

| Area | Connections |
|------|-------------|
| [slug] | 2 calls |

## How to Explore

1. `gitnexus_context({name: "getProductByHandle"})` — see callers and callees
2. `gitnexus_query({query: "services"})` — find related execution flows
3. Read key files listed above for implementation details
