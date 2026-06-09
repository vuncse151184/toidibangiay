---
name: persistence
description: "Skill for the Persistence area of toidibangiay. 58 symbols across 46 files."
---

# Persistence

58 symbols | 46 files | Cohesion: 100%

## When to Use

- Working with code in `backend/`
- Understanding how PrismaUserReadRepository, PrismaAddressRepository, PrismaVerificationTokenRepository work
- Modifying persistence-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `backend/services/cart-service/src/modules/cart/infrastructure/persistence/prisma-cart.repository.ts` | getByUserId, addOrUpdateItem, updateItemQuantity, removeItem, toView (+1) |
| `user-service-clean-architecture/user-service-clean-architecture/src/modules/users/infrastructure/persistence/prisma-user-read.repository.ts` | PrismaUserReadRepository, getMeByUserId, updateProfile |
| `backend/services/user-service/src/modules/users/infrastructure/persistence/prisma-user-read.repository.ts` | PrismaUserReadRepository, getMeByUserId, updateProfile |
| `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/infrastructure/persistence/prisma-identity.repository.ts` | createPasswordIdentity, PrismaIdentityRepository |
| `backend/services/user-service/src/modules/auth/infrastructure/persistence/prisma-identity.repository.ts` | createPasswordIdentity, PrismaIdentityRepository |
| `backend/services/auth-service/src/modules/auth/domain/ports/identity.repository.port.ts` | create, IdentityRepositoryPort |
| `user-service-clean-architecture/user-service-clean-architecture/src/modules/users/domain/ports/user-read.repository.port.ts` | UserReadRepositoryPort |
| `user-service-clean-architecture/user-service-clean-architecture/src/modules/users/infrastructure/persistence/prisma-address.repository.ts` | PrismaAddressRepository |
| `user-service-clean-architecture/user-service-clean-architecture/src/modules/users/domain/ports/address.repository.port.ts` | AddressRepositoryPort |
| `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/infrastructure/persistence/prisma-verification-token.repository.ts` | PrismaVerificationTokenRepository |

## Entry Points

Start here when exploring this area:

- **`PrismaUserReadRepository`** (Class) — `user-service-clean-architecture/user-service-clean-architecture/src/modules/users/infrastructure/persistence/prisma-user-read.repository.ts:10`
- **`PrismaAddressRepository`** (Class) — `user-service-clean-architecture/user-service-clean-architecture/src/modules/users/infrastructure/persistence/prisma-address.repository.ts:11`
- **`PrismaVerificationTokenRepository`** (Class) — `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/infrastructure/persistence/prisma-verification-token.repository.ts:10`
- **`PrismaUserRepository`** (Class) — `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/infrastructure/persistence/prisma-user.repository.ts:10`
- **`PrismaSessionRepository`** (Class) — `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/infrastructure/persistence/prisma-session.repository.ts:10`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `PrismaUserReadRepository` | Class | `user-service-clean-architecture/user-service-clean-architecture/src/modules/users/infrastructure/persistence/prisma-user-read.repository.ts` | 10 |
| `PrismaAddressRepository` | Class | `user-service-clean-architecture/user-service-clean-architecture/src/modules/users/infrastructure/persistence/prisma-address.repository.ts` | 11 |
| `PrismaVerificationTokenRepository` | Class | `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/infrastructure/persistence/prisma-verification-token.repository.ts` | 10 |
| `PrismaUserRepository` | Class | `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/infrastructure/persistence/prisma-user.repository.ts` | 10 |
| `PrismaSessionRepository` | Class | `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/infrastructure/persistence/prisma-session.repository.ts` | 10 |
| `PrismaPasswordResetRepository` | Class | `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/infrastructure/persistence/prisma-password-reset.repository.ts` | 10 |
| `PrismaIdentityRepository` | Class | `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/infrastructure/persistence/prisma-identity.repository.ts` | 11 |
| `PrismaAuditLoginLogRepository` | Class | `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/infrastructure/persistence/prisma-audit-login-log.repository.ts` | 9 |
| `PrismaUserReadRepository` | Class | `backend/services/user-service/src/modules/users/infrastructure/persistence/prisma-user-read.repository.ts` | 10 |
| `PrismaAddressRepository` | Class | `backend/services/user-service/src/modules/users/infrastructure/persistence/prisma-address.repository.ts` | 11 |
| `PrismaVerificationTokenRepository` | Class | `backend/services/user-service/src/modules/auth/infrastructure/persistence/prisma-verification-token.repository.ts` | 10 |
| `PrismaUserRepository` | Class | `backend/services/user-service/src/modules/auth/infrastructure/persistence/prisma-user.repository.ts` | 10 |
| `PrismaSessionRepository` | Class | `backend/services/user-service/src/modules/auth/infrastructure/persistence/prisma-session.repository.ts` | 10 |
| `PrismaPasswordResetRepository` | Class | `backend/services/user-service/src/modules/auth/infrastructure/persistence/prisma-password-reset.repository.ts` | 10 |
| `PrismaIdentityRepository` | Class | `backend/services/user-service/src/modules/auth/infrastructure/persistence/prisma-identity.repository.ts` | 11 |
| `PrismaAuditLoginLogRepository` | Class | `backend/services/user-service/src/modules/auth/infrastructure/persistence/prisma-audit-login-log.repository.ts` | 9 |
| `PrismaCartRepository` | Class | `backend/services/cart-service/src/modules/cart/infrastructure/persistence/prisma-cart.repository.ts` | 11 |
| `PrismaVerificationTokenRepository` | Class | `backend/services/auth-service/src/modules/auth/infrastructure/persistence/prisma-verification-token.repository.ts` | 9 |
| `PrismaUserRepository` | Class | `backend/services/auth-service/src/modules/auth/infrastructure/persistence/prisma-user.repository.ts` | 6 |
| `PrismaSessionRepository` | Class | `backend/services/auth-service/src/modules/auth/infrastructure/persistence/prisma-session.repository.ts` | 7 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `AddOrUpdateItem → ToView` | intra_community | 3 |
| `UpdateItemQuantity → ToView` | intra_community | 3 |
| `RemoveItem → ToView` | intra_community | 3 |

## How to Explore

1. `gitnexus_context({name: "PrismaUserReadRepository"})` — see callers and callees
2. `gitnexus_query({query: "persistence"})` — find related execution flows
3. Read key files listed above for implementation details
