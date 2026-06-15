import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/database/prisma.service';
import {
  SocialIdentityData,
  SocialIdentityRepositoryPort,
} from '../../domain/ports/social-identity.repository.port';

@Injectable()
export class PrismaSocialIdentityRepository
  implements SocialIdentityRepositoryPort
{
  constructor(private readonly prisma: PrismaService) {}

  async findByProviderAndProviderId(
    provider: string,
    providerId: string,
  ): Promise<SocialIdentityData | null> {
    return this.prisma.socialIdentity.findUnique({
      where: { provider_providerId: { provider, providerId } },
    });
  }

  async create(input: {
    userId: string;
    provider: string;
    providerId: string;
    email?: string | null;
    displayName?: string | null;
  }): Promise<SocialIdentityData> {
    return this.prisma.socialIdentity.create({ data: input });
  }
}
