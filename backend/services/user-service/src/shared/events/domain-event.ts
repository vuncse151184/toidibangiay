export interface DomainEvent<TPayload = Record<string, unknown>> {
  eventId: string;
  eventType: string;
  occurredAt: string;
  aggregateId: string;
  aggregateType: string;
  version: number;
  payload: TPayload;
}
