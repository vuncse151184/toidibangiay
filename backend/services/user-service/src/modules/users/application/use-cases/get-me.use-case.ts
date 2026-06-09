import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  USER_READ_REPOSITORY,
  UserReadRepositoryPort,
} from '../../domain/ports/user-read.repository.port';

@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject(USER_READ_REPOSITORY)
    private readonly userReadRepository: UserReadRepositoryPort,
  ) {}

  async execute(userId: string) {
    const me = await this.userReadRepository.getMeByUserId(userId);

    if (!me) {
      throw new NotFoundException('User not found');
    }

    return me;
  }
}
