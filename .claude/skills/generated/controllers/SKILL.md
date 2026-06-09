---
name: controllers
description: "Skill for the Controllers area of toidibangiay. 18 symbols across 6 files."
---

# Controllers

18 symbols | 6 files | Cohesion: 100%

## When to Use

- Working with code in `backend/`
- Understanding how setRefreshCookie, clearRefreshCookie, setRefreshCookie work
- Modifying controllers-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/infrastructure/controllers/auth.controller.ts` | login, refresh, logout, extractCookieValue |
| `backend/services/user-service/src/modules/auth/infrastructure/controllers/auth.controller.ts` | login, refresh, logout, extractCookieValue |
| `backend/services/auth-service/src/modules/auth/infrastructure/controllers/auth.controller.ts` | login, refresh, logout, parseCookie |
| `user-service-clean-architecture/user-service-clean-architecture/src/shared/security/cookie.util.ts` | setRefreshCookie, clearRefreshCookie |
| `backend/services/user-service/src/shared/security/cookie.util.ts` | setRefreshCookie, clearRefreshCookie |
| `backend/services/auth-service/src/shared/security/cookie.util.ts` | setRefreshCookie, clearRefreshCookie |

## Entry Points

Start here when exploring this area:

- **`setRefreshCookie`** (Function) — `user-service-clean-architecture/user-service-clean-architecture/src/shared/security/cookie.util.ts:6`
- **`clearRefreshCookie`** (Function) — `user-service-clean-architecture/user-service-clean-architecture/src/shared/security/cookie.util.ts:17`
- **`setRefreshCookie`** (Function) — `backend/services/user-service/src/shared/security/cookie.util.ts:6`
- **`clearRefreshCookie`** (Function) — `backend/services/user-service/src/shared/security/cookie.util.ts:17`
- **`setRefreshCookie`** (Function) — `backend/services/auth-service/src/shared/security/cookie.util.ts:6`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `setRefreshCookie` | Function | `user-service-clean-architecture/user-service-clean-architecture/src/shared/security/cookie.util.ts` | 6 |
| `clearRefreshCookie` | Function | `user-service-clean-architecture/user-service-clean-architecture/src/shared/security/cookie.util.ts` | 17 |
| `setRefreshCookie` | Function | `backend/services/user-service/src/shared/security/cookie.util.ts` | 6 |
| `clearRefreshCookie` | Function | `backend/services/user-service/src/shared/security/cookie.util.ts` | 17 |
| `setRefreshCookie` | Function | `backend/services/auth-service/src/shared/security/cookie.util.ts` | 6 |
| `clearRefreshCookie` | Function | `backend/services/auth-service/src/shared/security/cookie.util.ts` | 17 |
| `login` | Method | `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/infrastructure/controllers/auth.controller.ts` | 49 |
| `refresh` | Method | `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/infrastructure/controllers/auth.controller.ts` | 71 |
| `logout` | Method | `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/infrastructure/controllers/auth.controller.ts` | 91 |
| `login` | Method | `backend/services/user-service/src/modules/auth/infrastructure/controllers/auth.controller.ts` | 49 |
| `refresh` | Method | `backend/services/user-service/src/modules/auth/infrastructure/controllers/auth.controller.ts` | 71 |
| `logout` | Method | `backend/services/user-service/src/modules/auth/infrastructure/controllers/auth.controller.ts` | 91 |
| `login` | Method | `backend/services/auth-service/src/modules/auth/infrastructure/controllers/auth.controller.ts` | 49 |
| `refresh` | Method | `backend/services/auth-service/src/modules/auth/infrastructure/controllers/auth.controller.ts` | 62 |
| `logout` | Method | `backend/services/auth-service/src/modules/auth/infrastructure/controllers/auth.controller.ts` | 75 |
| `extractCookieValue` | Function | `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/infrastructure/controllers/auth.controller.ts` | 125 |
| `extractCookieValue` | Function | `backend/services/user-service/src/modules/auth/infrastructure/controllers/auth.controller.ts` | 125 |
| `parseCookie` | Function | `backend/services/auth-service/src/modules/auth/infrastructure/controllers/auth.controller.ts` | 105 |

## How to Explore

1. `gitnexus_context({name: "setRefreshCookie"})` — see callers and callees
2. `gitnexus_query({query: "controllers"})` — find related execution flows
3. Read key files listed above for implementation details
