---
name: persistence
description: "Skill for the Persistence area of backend. 18 symbols across 16 files."
---

# Persistence

18 symbols | 16 files | Cohesion: 100%

## When to Use

- Working with code in `services/`
- Understanding how PrismaUserReadRepository, PrismaAddressRepository, PrismaVerificationTokenRepository work
- Modifying persistence-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `services/user-service/src/modules/users/infrastructure/persistence/prisma-user-read.repository.ts` | PrismaUserReadRepository, getMeByUserId, updateProfile |
| `services/user-service/src/modules/users/domain/ports/user-read.repository.port.ts` | UserReadRepositoryPort |
| `services/user-service/src/modules/users/infrastructure/persistence/prisma-address.repository.ts` | PrismaAddressRepository |
| `services/user-service/src/modules/users/domain/ports/address.repository.port.ts` | AddressRepositoryPort |
| `services/user-service/src/modules/auth/infrastructure/persistence/prisma-verification-token.repository.ts` | PrismaVerificationTokenRepository |
| `services/user-service/src/modules/auth/domain/ports/verification-token.repository.port.ts` | VerificationTokenRepositoryPort |
| `services/user-service/src/modules/auth/infrastructure/persistence/prisma-user.repository.ts` | PrismaUserRepository |
| `services/user-service/src/modules/auth/domain/ports/user.repository.port.ts` | UserRepositoryPort |
| `services/user-service/src/modules/auth/infrastructure/persistence/prisma-session.repository.ts` | PrismaSessionRepository |
| `services/user-service/src/modules/auth/domain/ports/session.repository.port.ts` | SessionRepositoryPort |

## Entry Points

Start here when exploring this area:

- **`PrismaUserReadRepository`** (Class) — `services/user-service/src/modules/users/infrastructure/persistence/prisma-user-read.repository.ts:10`
- **`PrismaAddressRepository`** (Class) — `services/user-service/src/modules/users/infrastructure/persistence/prisma-address.repository.ts:11`
- **`PrismaVerificationTokenRepository`** (Class) — `services/user-service/src/modules/auth/infrastructure/persistence/prisma-verification-token.repository.ts:10`
- **`PrismaUserRepository`** (Class) — `services/user-service/src/modules/auth/infrastructure/persistence/prisma-user.repository.ts:10`
- **`PrismaSessionRepository`** (Class) — `services/user-service/src/modules/auth/infrastructure/persistence/prisma-session.repository.ts:10`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `PrismaUserReadRepository` | Class | `services/user-service/src/modules/users/infrastructure/persistence/prisma-user-read.repository.ts` | 10 |
| `PrismaAddressRepository` | Class | `services/user-service/src/modules/users/infrastructure/persistence/prisma-address.repository.ts` | 11 |
| `PrismaVerificationTokenRepository` | Class | `services/user-service/src/modules/auth/infrastructure/persistence/prisma-verification-token.repository.ts` | 10 |
| `PrismaUserRepository` | Class | `services/user-service/src/modules/auth/infrastructure/persistence/prisma-user.repository.ts` | 10 |
| `PrismaSessionRepository` | Class | `services/user-service/src/modules/auth/infrastructure/persistence/prisma-session.repository.ts` | 10 |
| `PrismaPasswordResetRepository` | Class | `services/user-service/src/modules/auth/infrastructure/persistence/prisma-password-reset.repository.ts` | 10 |
| `PrismaIdentityRepository` | Class | `services/user-service/src/modules/auth/infrastructure/persistence/prisma-identity.repository.ts` | 11 |
| `PrismaAuditLoginLogRepository` | Class | `services/user-service/src/modules/auth/infrastructure/persistence/prisma-audit-login-log.repository.ts` | 9 |
| `UserReadRepositoryPort` | Interface | `services/user-service/src/modules/users/domain/ports/user-read.repository.port.ts` | 12 |
| `AddressRepositoryPort` | Interface | `services/user-service/src/modules/users/domain/ports/address.repository.port.ts` | 21 |
| `VerificationTokenRepositoryPort` | Interface | `services/user-service/src/modules/auth/domain/ports/verification-token.repository.port.ts` | 16 |
| `UserRepositoryPort` | Interface | `services/user-service/src/modules/auth/domain/ports/user.repository.port.ts` | 6 |
| `SessionRepositoryPort` | Interface | `services/user-service/src/modules/auth/domain/ports/session.repository.port.ts` | 14 |
| `PasswordResetRepositoryPort` | Interface | `services/user-service/src/modules/auth/domain/ports/password-reset.repository.port.ts` | 16 |
| `IdentityRepositoryPort` | Interface | `services/user-service/src/modules/auth/domain/ports/identity.repository.port.ts` | 11 |
| `AuditLoginLogRepositoryPort` | Interface | `services/user-service/src/modules/auth/domain/ports/audit-login-log.repository.port.ts` | 10 |
| `getMeByUserId` | Method | `services/user-service/src/modules/users/infrastructure/persistence/prisma-user-read.repository.ts` | 13 |
| `updateProfile` | Method | `services/user-service/src/modules/users/infrastructure/persistence/prisma-user-read.repository.ts` | 51 |

## How to Explore

1. `gitnexus_context({name: "PrismaUserReadRepository"})` — see callers and callees
2. `gitnexus_query({query: "persistence"})` — find related execution flows
3. Read key files listed above for implementation details
