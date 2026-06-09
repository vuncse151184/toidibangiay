import { AddressType } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/database/prisma.service';
import { UserAddressView } from '../../domain/models/user-address';
import {
  AddressRepositoryPort,
  CreateAddressInput,
} from '../../domain/ports/address.repository.port';

@Injectable()
export class PrismaAddressRepository implements AddressRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async listByUserId(userId: string): Promise<UserAddressView[]> {
    const addresses = await this.prisma.userAddress.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return addresses.map((address) => ({
      id: address.id,
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      countryCode: address.countryCode,
      province: address.province,
      district: address.district,
      ward: address.ward,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      postalCode: address.postalCode,
      isDefaultShipping: address.isDefaultShipping,
      isDefaultBilling: address.isDefaultBilling,
      type: address.type,
    }));
  }

  async create(input: CreateAddressInput): Promise<UserAddressView> {
    return this.prisma.$transaction(async (tx) => {
      if (input.isDefaultShipping) {
        await tx.userAddress.updateMany({
          where: { userId: input.userId },
          data: { isDefaultShipping: false },
        });
      }

      if (input.isDefaultBilling) {
        await tx.userAddress.updateMany({
          where: { userId: input.userId },
          data: { isDefaultBilling: false },
        });
      }

      const address = await tx.userAddress.create({
        data: {
          userId: input.userId,
          label: input.label,
          recipientName: input.recipientName,
          phone: input.phone,
          countryCode: input.countryCode,
          province: input.province,
          district: input.district,
          ward: input.ward,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2,
          postalCode: input.postalCode,
          isDefaultShipping: input.isDefaultShipping ?? false,
          isDefaultBilling: input.isDefaultBilling ?? false,
          type: input.type as AddressType,
        },
      });

      return {
        id: address.id,
        label: address.label,
        recipientName: address.recipientName,
        phone: address.phone,
        countryCode: address.countryCode,
        province: address.province,
        district: address.district,
        ward: address.ward,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        postalCode: address.postalCode,
        isDefaultShipping: address.isDefaultShipping,
        isDefaultBilling: address.isDefaultBilling,
        type: address.type,
      };
    });
  }
}
