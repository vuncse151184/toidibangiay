import { Injectable } from '@nestjs/common';
import { UserStatus } from '@prisma/client';

import { PrismaService } from '../../../../shared/database/prisma.service';
import {
  CreateUserAggregateInput,
  UserRepositoryPort,
} from '../../domain/ports/user.repository.port';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async existsByEmail(emailNormalized: string): Promise<boolean> {
    const count = await this.prisma.userIdentity.count({
      where: { emailNormalized },
    });

    return count > 0;
  }

  async createUserAggregate(input: CreateUserAggregateInput): Promise<{ userId: string }> {
    const user = await this.prisma.user.create({
      data: {
        status: UserStatus.PENDING_VERIFICATION,
        profile: {
          create: {
            fullName: input.fullName,
          },
        },
      },
    });

    return { userId: user.id };
  }

  async assignRoleByCode(userId: string, roleCode: string): Promise<void> {
    const role = await this.prisma.role.upsert({
      where: { code: roleCode },
      update: {},
      create: {
        code: roleCode,
        name: roleCode,
      },
    });

    await this.prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        userId,
        roleId: role.id,
      },
    });
  }

  async activateUser(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.ACTIVE,
      },
    });
  }

  async findRolesByUserId(userId: string): Promise<string[]> {
    const rows = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });

    return rows.map((row) => row.role.code);
  }

  async findUserByEmail(emailNormalized: string): Promise<{ userId: string } | null> {
    const identity = await this.prisma.userIdentity.findFirst({
      where: { emailNormalized },
      select: { userId: true },
    });

    return identity;
  }

  async findPrimaryEmailByUserId(userId: string): Promise<string | null> {
    const identity = await this.prisma.userIdentity.findFirst({
      where: {
        userId,
        provider: 'PASSWORD',
      },
      select: {
        email: true,
      },
    });

    return identity?.email ?? null;
  }
}
