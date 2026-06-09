import { randomUUID } from 'crypto';

import { DomainEvent } from '../../../../shared/events/domain-event';

export function buildUserRegisteredEvent(input: {
  userId: string;
  email: string;
}): DomainEvent<{
  userId: string;
  email: string;
  registeredAt: string;
}> {
  const occurredAt = new Date().toISOString();
  return {
    eventId: randomUUID(),
    eventType: 'UserRegistered',
    occurredAt,
    aggregateId: input.userId,
    aggregateType: 'User',
    version: 1,
    payload: {
      userId: input.userId,
      email: input.email,
      registeredAt: occurredAt,
    },
  };
}
