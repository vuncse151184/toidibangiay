---
name: security
description: "Skill for the Security area of toidibangiay. 18 symbols across 9 files."
---

# Security

18 symbols | 9 files | Cohesion: 100%

## When to Use

- Working with code in `backend/`
- Understanding how Argon2PasswordHasherService, Argon2PasswordHasherService, Argon2PasswordHasherService work
- Modifying security-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `user-service-clean-architecture/user-service-clean-architecture/src/shared/security/token.service.ts` | issueRefreshToken, rotateRefreshToken, issueOneTimeToken, hashOpaqueToken |
| `backend/services/user-service/src/shared/security/token.service.ts` | issueRefreshToken, rotateRefreshToken, issueOneTimeToken, hashOpaqueToken |
| `backend/services/auth-service/src/shared/security/token.service.ts` | issueRefreshToken, rotateRefreshToken, issueOneTimeToken, hashToken |
| `user-service-clean-architecture/user-service-clean-architecture/src/shared/security/password-hasher.port.ts` | PasswordHasherPort |
| `user-service-clean-architecture/user-service-clean-architecture/src/shared/security/argon2-password-hasher.service.ts` | Argon2PasswordHasherService |
| `backend/services/user-service/src/shared/security/password-hasher.port.ts` | PasswordHasherPort |
| `backend/services/user-service/src/shared/security/argon2-password-hasher.service.ts` | Argon2PasswordHasherService |
| `backend/services/auth-service/src/shared/security/password-hasher.port.ts` | PasswordHasherPort |
| `backend/services/auth-service/src/shared/security/argon2-password-hasher.service.ts` | Argon2PasswordHasherService |

## Entry Points

Start here when exploring this area:

- **`Argon2PasswordHasherService`** (Class) — `user-service-clean-architecture/user-service-clean-architecture/src/shared/security/argon2-password-hasher.service.ts:6`
- **`Argon2PasswordHasherService`** (Class) — `backend/services/user-service/src/shared/security/argon2-password-hasher.service.ts:6`
- **`Argon2PasswordHasherService`** (Class) — `backend/services/auth-service/src/shared/security/argon2-password-hasher.service.ts:6`
- **`issueRefreshToken`** (Method) — `user-service-clean-architecture/user-service-clean-architecture/src/shared/security/token.service.ts:35`
- **`rotateRefreshToken`** (Method) — `user-service-clean-architecture/user-service-clean-architecture/src/shared/security/token.service.ts:54`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `Argon2PasswordHasherService` | Class | `user-service-clean-architecture/user-service-clean-architecture/src/shared/security/argon2-password-hasher.service.ts` | 6 |
| `Argon2PasswordHasherService` | Class | `backend/services/user-service/src/shared/security/argon2-password-hasher.service.ts` | 6 |
| `Argon2PasswordHasherService` | Class | `backend/services/auth-service/src/shared/security/argon2-password-hasher.service.ts` | 6 |
| `PasswordHasherPort` | Interface | `user-service-clean-architecture/user-service-clean-architecture/src/shared/security/password-hasher.port.ts` | 2 |
| `PasswordHasherPort` | Interface | `backend/services/user-service/src/shared/security/password-hasher.port.ts` | 2 |
| `PasswordHasherPort` | Interface | `backend/services/auth-service/src/shared/security/password-hasher.port.ts` | 2 |
| `issueRefreshToken` | Method | `user-service-clean-architecture/user-service-clean-architecture/src/shared/security/token.service.ts` | 35 |
| `rotateRefreshToken` | Method | `user-service-clean-architecture/user-service-clean-architecture/src/shared/security/token.service.ts` | 54 |
| `issueOneTimeToken` | Method | `user-service-clean-architecture/user-service-clean-architecture/src/shared/security/token.service.ts` | 71 |
| `hashOpaqueToken` | Method | `user-service-clean-architecture/user-service-clean-architecture/src/shared/security/token.service.ts` | 85 |
| `issueRefreshToken` | Method | `backend/services/user-service/src/shared/security/token.service.ts` | 35 |
| `rotateRefreshToken` | Method | `backend/services/user-service/src/shared/security/token.service.ts` | 54 |
| `issueOneTimeToken` | Method | `backend/services/user-service/src/shared/security/token.service.ts` | 71 |
| `hashOpaqueToken` | Method | `backend/services/user-service/src/shared/security/token.service.ts` | 85 |
| `issueRefreshToken` | Method | `backend/services/auth-service/src/shared/security/token.service.ts` | 24 |
| `rotateRefreshToken` | Method | `backend/services/auth-service/src/shared/security/token.service.ts` | 34 |
| `issueOneTimeToken` | Method | `backend/services/auth-service/src/shared/security/token.service.ts` | 43 |
| `hashToken` | Method | `backend/services/auth-service/src/shared/security/token.service.ts` | 52 |

## How to Explore

1. `gitnexus_context({name: "Argon2PasswordHasherService"})` — see callers and callees
2. `gitnexus_query({query: "security"})` — find related execution flows
3. Read key files listed above for implementation details
