import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/database/prisma.service';
import {
  PasswordResetRecord,
  PasswordResetRepositoryPort,
} from '../../domain/ports/password-reset.repository.port';

@Injectable()
export class PrismaPasswordResetRepository implements PasswordResetRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    await this.prisma.passwordResetToken.create({ data: input });
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetRecord | null> {
    return this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  }

  async markUsed(id: string): Promise<void> {
    await this.prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }
}
