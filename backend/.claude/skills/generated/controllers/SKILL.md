---
name: controllers
description: "Skill for the Controllers area of backend. 6 symbols across 2 files."
---

# Controllers

6 symbols | 2 files | Cohesion: 100%

## When to Use

- Working with code in `services/`
- Understanding how setRefreshCookie, clearRefreshCookie, login work
- Modifying controllers-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `services/user-service/src/modules/auth/infrastructure/controllers/auth.controller.ts` | login, refresh, logout, extractCookieValue |
| `services/user-service/src/shared/security/cookie.util.ts` | setRefreshCookie, clearRefreshCookie |

## Entry Points

Start here when exploring this area:

- **`setRefreshCookie`** (Function) — `services/user-service/src/shared/security/cookie.util.ts:6`
- **`clearRefreshCookie`** (Function) — `services/user-service/src/shared/security/cookie.util.ts:17`
- **`login`** (Method) — `services/user-service/src/modules/auth/infrastructure/controllers/auth.controller.ts:49`
- **`refresh`** (Method) — `services/user-service/src/modules/auth/infrastructure/controllers/auth.controller.ts:71`
- **`logout`** (Method) — `services/user-service/src/modules/auth/infrastructure/controllers/auth.controller.ts:91`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `setRefreshCookie` | Function | `services/user-service/src/shared/security/cookie.util.ts` | 6 |
| `clearRefreshCookie` | Function | `services/user-service/src/shared/security/cookie.util.ts` | 17 |
| `login` | Method | `services/user-service/src/modules/auth/infrastructure/controllers/auth.controller.ts` | 49 |
| `refresh` | Method | `services/user-service/src/modules/auth/infrastructure/controllers/auth.controller.ts` | 71 |
| `logout` | Method | `services/user-service/src/modules/auth/infrastructure/controllers/auth.controller.ts` | 91 |
| `extractCookieValue` | Function | `services/user-service/src/modules/auth/infrastructure/controllers/auth.controller.ts` | 125 |

## How to Explore

1. `gitnexus_context({name: "setRefreshCookie"})` — see callers and callees
2. `gitnexus_query({query: "controllers"})` — find related execution flows
3. Read key files listed above for implementation details
