import { Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { DomainEvent } from './domain-event';
import { EventBusPort } from './event-bus.port';

@Injectable()
export class PrismaOutboxEventBusAdapter implements EventBusPort {
  constructor(private readonly prisma: PrismaService) {}

  async publish<TPayload>(event: DomainEvent<TPayload>): Promise<void> {
    await this.prisma.outboxEvent.create({
      data: {
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        eventType: event.eventType,
        payloadJson: event.payload as object,
      },
    });
  }
}
