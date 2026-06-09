import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../shared/database/prisma.service';
import { MeView } from '../../domain/models/me-view';
import {
  UpdateProfileInput,
  UserReadRepositoryPort,
} from '../../domain/ports/user-read.repository.port';

@Injectable()
export class PrismaUserReadRepository implements UserReadRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async getMeByUserId(userId: string): Promise<MeView | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        identities: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    const passwordIdentity = user.identities.find(
      (identity) => identity.provider === 'PASSWORD',
    );

    return {
      id: user.id,
      status: user.status,
      email: passwordIdentity?.email ?? null,
      emailVerified: Boolean(passwordIdentity?.emailVerifiedAt),
      profile: {
        fullName: user.profile?.fullName ?? null,
        firstName: user.profile?.firstName ?? null,
        lastName: user.profile?.lastName ?? null,
        phone: user.profile?.phone ?? null,
        avatarUrl: user.profile?.avatarUrl ?? null,
      },
      roles: user.roles.map((item) => item.role.code),
    };
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<MeView> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.profile) {
      await this.prisma.userProfile.update({
        where: { userId },
        data: {
          fullName: input.fullName,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          avatarUrl: input.avatarUrl,
        },
      });
    } else {
      await this.prisma.userProfile.create({
        data: {
          userId,
          fullName: input.fullName,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          avatarUrl: input.avatarUrl,
        },
      });
    }

    const me = await this.getMeByUserId(userId);

    if (!me) {
      throw new NotFoundException('User not found after profile update');
    }

    return me;
  }
}
