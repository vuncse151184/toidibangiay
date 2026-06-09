import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/database/prisma.service';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async existsByEmail(emailNormalized: string): Promise<boolean> {
    const count = await this.prisma.authIdentity.count({
      where: { emailNormalized },
    });
    return count > 0;
  }

  async createUser(input: { fullName: string }): Promise<{ userId: string }> {
    const user = await this.prisma.authUser.create({
      data: { fullName: input.fullName },
    });
    return { userId: user.id };
  }

  async activateUser(userId: string): Promise<void> {
    await this.prisma.authUser.update({
      where: { id: userId },
      data: { status: 'ACTIVE' },
    });
  }

  async findRolesByUserId(userId: string): Promise<string[]> {
    const user = await this.prisma.authUser.findUnique({
      where: { id: userId },
      select: { roles: true },
    });
    return user?.roles ?? ['CUSTOMER'];
  }
}
