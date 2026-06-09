---
name: services
description: "Skill for the Services area of backend. 7 symbols across 2 files."
---

# Services

7 symbols | 2 files | Cohesion: 100%

## When to Use

- Working with code in `services/`
- Understanding how RedisLoginRateLimitService, assertNotRateLimited, registerFailure work
- Modifying services-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `services/user-service/src/modules/auth/infrastructure/services/redis-login-rate-limit.service.ts` | assertNotRateLimited, registerFailure, reset, emailKey, ipKey (+1) |
| `services/user-service/src/modules/auth/domain/ports/login-rate-limit.service.port.ts` | LoginRateLimitServicePort |

## Entry Points

Start here when exploring this area:

- **`RedisLoginRateLimitService`** (Class) — `services/user-service/src/modules/auth/infrastructure/services/redis-login-rate-limit.service.ts:15`
- **`assertNotRateLimited`** (Method) — `services/user-service/src/modules/auth/infrastructure/services/redis-login-rate-limit.service.ts:23`
- **`registerFailure`** (Method) — `services/user-service/src/modules/auth/infrastructure/services/redis-login-rate-limit.service.ts:41`
- **`reset`** (Method) — `services/user-service/src/modules/auth/infrastructure/services/redis-login-rate-limit.service.ts:70`
- **`emailKey`** (Method) — `services/user-service/src/modules/auth/infrastructure/services/redis-login-rate-limit.service.ts:74`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `RedisLoginRateLimitService` | Class | `services/user-service/src/modules/auth/infrastructure/services/redis-login-rate-limit.service.ts` | 15 |
| `LoginRateLimitServicePort` | Interface | `services/user-service/src/modules/auth/domain/ports/login-rate-limit.service.port.ts` | 6 |
| `assertNotRateLimited` | Method | `services/user-service/src/modules/auth/infrastructure/services/redis-login-rate-limit.service.ts` | 23 |
| `registerFailure` | Method | `services/user-service/src/modules/auth/infrastructure/services/redis-login-rate-limit.service.ts` | 41 |
| `reset` | Method | `services/user-service/src/modules/auth/infrastructure/services/redis-login-rate-limit.service.ts` | 70 |
| `emailKey` | Method | `services/user-service/src/modules/auth/infrastructure/services/redis-login-rate-limit.service.ts` | 74 |
| `ipKey` | Method | `services/user-service/src/modules/auth/infrastructure/services/redis-login-rate-limit.service.ts` | 78 |

## How to Explore

1. `gitnexus_context({name: "RedisLoginRateLimitService"})` — see callers and callees
2. `gitnexus_query({query: "services"})` — find related execution flows
3. Read key files listed above for implementation details
