import { Inject, Injectable } from '@nestjs/common';

import {
  ADDRESS_REPOSITORY,
  AddressRepositoryPort,
} from '../../domain/ports/address.repository.port';

@Injectable()
export class ListMyAddressesUseCase {
  constructor(
    @Inject(ADDRESS_REPOSITORY)
    private readonly addressRepository: AddressRepositoryPort,
  ) {}

  async execute(userId: string) {
    const items = await this.addressRepository.listByUserId(userId);
    return { items };
  }
}
