import { DomainEvent } from './domain-event';

export const EVENT_BUS = Symbol('EVENT_BUS');

export interface EventBusPort {
  publish<TPayload>(event: DomainEvent<TPayload>): Promise<void>;
}
