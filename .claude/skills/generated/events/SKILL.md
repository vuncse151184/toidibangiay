---
name: events
description: "Skill for the Events area of toidibangiay. 20 symbols across 20 files."
---

# Events

20 symbols | 20 files | Cohesion: 100%

## When to Use

- Working with code in `user-service-clean-architecture/`
- Understanding how buildUserProfileUpdatedEvent, buildUserVerifiedEvent, buildUserRegisteredEvent work
- Modifying events-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `user-service-clean-architecture/user-service-clean-architecture/src/shared/events/prisma-outbox-event-bus.adapter.ts` | PrismaOutboxEventBusAdapter |
| `user-service-clean-architecture/user-service-clean-architecture/src/shared/events/event-bus.port.ts` | EventBusPort |
| `backend/services/user-service/src/shared/events/prisma-outbox-event-bus.adapter.ts` | PrismaOutboxEventBusAdapter |
| `backend/services/user-service/src/shared/events/event-bus.port.ts` | EventBusPort |
| `user-service-clean-architecture/user-service-clean-architecture/src/modules/users/domain/events/user-profile-updated.event.ts` | buildUserProfileUpdatedEvent |
| `user-service-clean-architecture/user-service-clean-architecture/src/modules/users/application/use-cases/update-me.use-case.ts` | execute |
| `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/domain/events/user-verified.event.ts` | buildUserVerifiedEvent |
| `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/application/use-cases/verify-email.use-case.ts` | execute |
| `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/domain/events/user-registered.event.ts` | buildUserRegisteredEvent |
| `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/application/use-cases/register.use-case.ts` | execute |

## Entry Points

Start here when exploring this area:

- **`buildUserProfileUpdatedEvent`** (Function) — `user-service-clean-architecture/user-service-clean-architecture/src/modules/users/domain/events/user-profile-updated.event.ts:4`
- **`buildUserVerifiedEvent`** (Function) — `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/domain/events/user-verified.event.ts:4`
- **`buildUserRegisteredEvent`** (Function) — `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/domain/events/user-registered.event.ts:4`
- **`buildUserLockedEvent`** (Function) — `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/domain/events/user-locked.event.ts:4`
- **`buildUserProfileUpdatedEvent`** (Function) — `backend/services/user-service/src/modules/users/domain/events/user-profile-updated.event.ts:4`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `PrismaOutboxEventBusAdapter` | Class | `user-service-clean-architecture/user-service-clean-architecture/src/shared/events/prisma-outbox-event-bus.adapter.ts` | 7 |
| `PrismaOutboxEventBusAdapter` | Class | `backend/services/user-service/src/shared/events/prisma-outbox-event-bus.adapter.ts` | 7 |
| `buildUserProfileUpdatedEvent` | Function | `user-service-clean-architecture/user-service-clean-architecture/src/modules/users/domain/events/user-profile-updated.event.ts` | 4 |
| `buildUserVerifiedEvent` | Function | `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/domain/events/user-verified.event.ts` | 4 |
| `buildUserRegisteredEvent` | Function | `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/domain/events/user-registered.event.ts` | 4 |
| `buildUserLockedEvent` | Function | `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/domain/events/user-locked.event.ts` | 4 |
| `buildUserProfileUpdatedEvent` | Function | `backend/services/user-service/src/modules/users/domain/events/user-profile-updated.event.ts` | 4 |
| `buildUserVerifiedEvent` | Function | `backend/services/user-service/src/modules/auth/domain/events/user-verified.event.ts` | 4 |
| `buildUserRegisteredEvent` | Function | `backend/services/user-service/src/modules/auth/domain/events/user-registered.event.ts` | 4 |
| `buildUserLockedEvent` | Function | `backend/services/user-service/src/modules/auth/domain/events/user-locked.event.ts` | 4 |
| `EventBusPort` | Interface | `user-service-clean-architecture/user-service-clean-architecture/src/shared/events/event-bus.port.ts` | 4 |
| `EventBusPort` | Interface | `backend/services/user-service/src/shared/events/event-bus.port.ts` | 4 |
| `execute` | Method | `user-service-clean-architecture/user-service-clean-architecture/src/modules/users/application/use-cases/update-me.use-case.ts` | 19 |
| `execute` | Method | `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/application/use-cases/verify-email.use-case.ts` | 33 |
| `execute` | Method | `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/application/use-cases/register.use-case.ts` | 43 |
| `execute` | Method | `user-service-clean-architecture/user-service-clean-architecture/src/modules/auth/application/use-cases/login.use-case.ts` | 56 |
| `execute` | Method | `backend/services/user-service/src/modules/users/application/use-cases/update-me.use-case.ts` | 19 |
| `execute` | Method | `backend/services/user-service/src/modules/auth/application/use-cases/verify-email.use-case.ts` | 33 |
| `execute` | Method | `backend/services/user-service/src/modules/auth/application/use-cases/register.use-case.ts` | 43 |
| `execute` | Method | `backend/services/user-service/src/modules/auth/application/use-cases/login.use-case.ts` | 56 |

## How to Explore

1. `gitnexus_context({name: "buildUserProfileUpdatedEvent"})` — see callers and callees
2. `gitnexus_query({query: "events"})` — find related execution flows
3. Read key files listed above for implementation details
