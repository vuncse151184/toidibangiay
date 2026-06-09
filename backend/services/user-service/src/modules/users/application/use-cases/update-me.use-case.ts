import { Inject, Injectable } from '@nestjs/common';

import { EVENT_BUS, EventBusPort } from '../../../../shared/events/event-bus.port';
import { buildUserProfileUpdatedEvent } from '../../domain/events/user-profile-updated.event';
import {
  USER_READ_REPOSITORY,
  UserReadRepositoryPort,
} from '../../domain/ports/user-read.repository.port';
import { UpdateMeDto } from '../dto/update-me.dto';

@Injectable()
export class UpdateMeUseCase {
  constructor(
    @Inject(USER_READ_REPOSITORY)
    private readonly userReadRepository: UserReadRepositoryPort,
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBusPort,
  ) {}

  async execute(userId: string, input: UpdateMeDto) {
    const changedFields = Object.entries(input)
      .filter(([, value]) => value !== undefined)
      .map(([key]) => key);

    const result = await this.userReadRepository.updateProfile(userId, input);

    if (changedFields.length > 0) {
      await this.eventBus.publish(
        buildUserProfileUpdatedEvent({
          userId,
          changedFields,
        }),
      );
    }

    return result;
  }
}
