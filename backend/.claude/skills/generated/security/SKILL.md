---
name: security
description: "Skill for the Security area of backend. 6 symbols across 3 files."
---

# Security

6 symbols | 3 files | Cohesion: 100%

## When to Use

- Working with code in `services/`
- Understanding how Argon2PasswordHasherService, issueRefreshToken, rotateRefreshToken work
- Modifying security-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `services/user-service/src/shared/security/token.service.ts` | issueRefreshToken, rotateRefreshToken, issueOneTimeToken, hashOpaqueToken |
| `services/user-service/src/shared/security/password-hasher.port.ts` | PasswordHasherPort |
| `services/user-service/src/shared/security/argon2-password-hasher.service.ts` | Argon2PasswordHasherService |

## Entry Points

Start here when exploring this area:

- **`Argon2PasswordHasherService`** (Class) — `services/user-service/src/shared/security/argon2-password-hasher.service.ts:6`
- **`issueRefreshToken`** (Method) — `services/user-service/src/shared/security/token.service.ts:35`
- **`rotateRefreshToken`** (Method) — `services/user-service/src/shared/security/token.service.ts:54`
- **`issueOneTimeToken`** (Method) — `services/user-service/src/shared/security/token.service.ts:71`
- **`hashOpaqueToken`** (Method) — `services/user-service/src/shared/security/token.service.ts:85`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `Argon2PasswordHasherService` | Class | `services/user-service/src/shared/security/argon2-password-hasher.service.ts` | 6 |
| `PasswordHasherPort` | Interface | `services/user-service/src/shared/security/password-hasher.port.ts` | 2 |
| `issueRefreshToken` | Method | `services/user-service/src/shared/security/token.service.ts` | 35 |
| `rotateRefreshToken` | Method | `services/user-service/src/shared/security/token.service.ts` | 54 |
| `issueOneTimeToken` | Method | `services/user-service/src/shared/security/token.service.ts` | 71 |
| `hashOpaqueToken` | Method | `services/user-service/src/shared/security/token.service.ts` | 85 |

## How to Explore

1. `gitnexus_context({name: "Argon2PasswordHasherService"})` — see callers and callees
2. `gitnexus_query({query: "security"})` — find related execution flows
3. Read key files listed above for implementation details
