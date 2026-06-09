import { randomUUID } from 'crypto';

import { DomainEvent } from '../../../../shared/events/domain-event';

export function buildUserLockedEvent(input: {
  userId: string;
  lockedUntil: Date;
}): DomainEvent<{
  userId: string;
  reason: string;
  lockedUntil: string;
}> {
  const occurredAt = new Date().toISOString();
  return {
    eventId: randomUUID(),
    eventType: 'UserLocked',
    occurredAt,
    aggregateId: input.userId,
    aggregateType: 'User',
    version: 1,
    payload: {
      userId: input.userId,
      reason: 'TOO_MANY_FAILED_LOGINS',
      lockedUntil: input.lockedUntil.toISOString(),
    },
  };
}
