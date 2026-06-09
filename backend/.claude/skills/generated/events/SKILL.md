---
name: events
description: "Skill for the Events area of backend. 10 symbols across 10 files."
---

# Events

10 symbols | 10 files | Cohesion: 100%

## When to Use

- Working with code in `services/`
- Understanding how buildUserProfileUpdatedEvent, buildUserVerifiedEvent, buildUserRegisteredEvent work
- Modifying events-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `services/user-service/src/shared/events/prisma-outbox-event-bus.adapter.ts` | PrismaOutboxEventBusAdapter |
| `services/user-service/src/shared/events/event-bus.port.ts` | EventBusPort |
| `services/user-service/src/modules/users/domain/events/user-profile-updated.event.ts` | buildUserProfileUpdatedEvent |
| `services/user-service/src/modules/users/application/use-cases/update-me.use-case.ts` | execute |
| `services/user-service/src/modules/auth/domain/events/user-verified.event.ts` | buildUserVerifiedEvent |
| `services/user-service/src/modules/auth/application/use-cases/verify-email.use-case.ts` | execute |
| `services/user-service/src/modules/auth/domain/events/user-registered.event.ts` | buildUserRegisteredEvent |
| `services/user-service/src/modules/auth/application/use-cases/register.use-case.ts` | execute |
| `services/user-service/src/modules/auth/domain/events/user-locked.event.ts` | buildUserLockedEvent |
| `services/user-service/src/modules/auth/application/use-cases/login.use-case.ts` | execute |

## Entry Points

Start here when exploring this area:

- **`buildUserProfileUpdatedEvent`** (Function) — `services/user-service/src/modules/users/domain/events/user-profile-updated.event.ts:4`
- **`buildUserVerifiedEvent`** (Function) — `services/user-service/src/modules/auth/domain/events/user-verified.event.ts:4`
- **`buildUserRegisteredEvent`** (Function) — `services/user-service/src/modules/auth/domain/events/user-registered.event.ts:4`
- **`buildUserLockedEvent`** (Function) — `services/user-service/src/modules/auth/domain/events/user-locked.event.ts:4`
- **`PrismaOutboxEventBusAdapter`** (Class) — `services/user-service/src/shared/events/prisma-outbox-event-bus.adapter.ts:7`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `PrismaOutboxEventBusAdapter` | Class | `services/user-service/src/shared/events/prisma-outbox-event-bus.adapter.ts` | 7 |
| `buildUserProfileUpdatedEvent` | Function | `services/user-service/src/modules/users/domain/events/user-profile-updated.event.ts` | 4 |
| `buildUserVerifiedEvent` | Function | `services/user-service/src/modules/auth/domain/events/user-verified.event.ts` | 4 |
| `buildUserRegisteredEvent` | Function | `services/user-service/src/modules/auth/domain/events/user-registered.event.ts` | 4 |
| `buildUserLockedEvent` | Function | `services/user-service/src/modules/auth/domain/events/user-locked.event.ts` | 4 |
| `EventBusPort` | Interface | `services/user-service/src/shared/events/event-bus.port.ts` | 4 |
| `execute` | Method | `services/user-service/src/modules/users/application/use-cases/update-me.use-case.ts` | 19 |
| `execute` | Method | `services/user-service/src/modules/auth/application/use-cases/verify-email.use-case.ts` | 33 |
| `execute` | Method | `services/user-service/src/modules/auth/application/use-cases/register.use-case.ts` | 43 |
| `execute` | Method | `services/user-service/src/modules/auth/application/use-cases/login.use-case.ts` | 56 |

## How to Explore

1. `gitnexus_context({name: "buildUserProfileUpdatedEvent"})` — see callers and callees
2. `gitnexus_query({query: "events"})` — find related execution flows
3. Read key files listed above for implementation details
