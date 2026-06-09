import { Inject, Injectable } from '@nestjs/common';

import {
  ADDRESS_REPOSITORY,
  AddressRepositoryPort,
} from '../../domain/ports/address.repository.port';
import { CreateAddressDto } from '../dto/create-address.dto';

@Injectable()
export class CreateMyAddressUseCase {
  constructor(
    @Inject(ADDRESS_REPOSITORY)
    private readonly addressRepository: AddressRepositoryPort,
  ) {}

  async execute(userId: string, input: CreateAddressDto) {
    return this.addressRepository.create({
      userId,
      ...input,
    });
  }
}
