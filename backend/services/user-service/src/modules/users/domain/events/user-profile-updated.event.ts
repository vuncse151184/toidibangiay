import { randomUUID } from 'crypto';

import { DomainEvent } from '../../../../shared/events/domain-event';

export function buildUserProfileUpdatedEvent(input: {
  userId: string;
  changedFields: string[];
}): DomainEvent<{
  userId: string;
  changedFields: string[];
  updatedAt: string;
}> {
  const occurredAt = new Date().toISOString();

  return {
    eventId: randomUUID(),
    eventType: 'UserProfileUpdated',
    occurredAt,
    aggregateId: input.userId,
    aggregateType: 'User',
    version: 1,
    payload: {
      userId: input.userId,
      changedFields: input.changedFields,
      updatedAt: occurredAt,
    },
  };
}
