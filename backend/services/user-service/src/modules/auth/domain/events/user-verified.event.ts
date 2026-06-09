import { randomUUID } from 'crypto';

import { DomainEvent } from '../../../../shared/events/domain-event';

export function buildUserVerifiedEvent(input: {
  userId: string;
  email: string;
}): DomainEvent<{
  userId: string;
  email: string;
  verifiedAt: string;
}> {
  const occurredAt = new Date().toISOString();
  return {
    eventId: randomUUID(),
    eventType: 'UserVerified',
    occurredAt,
    aggregateId: input.userId,
    aggregateType: 'User',
    version: 1,
    payload: {
      userId: input.userId,
      email: input.email,
      verifiedAt: occurredAt,
    },
  };
}
