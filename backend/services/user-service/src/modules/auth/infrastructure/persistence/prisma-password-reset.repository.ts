import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/database/prisma.service';
import {
  CreatePasswordResetTokenInput,
  PasswordResetRecord,
  PasswordResetRepositoryPort,
} from '../../domain/ports/password-reset.repository.port';

@Injectable()
export class PrismaPasswordResetRepository
  implements PasswordResetRepositoryPort
{
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreatePasswordResetTokenInput): Promise<void> {
    await this.prisma.passwordResetToken.create({
      data: {
        userId: input.userId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      },
    });
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetRecord | null> {
    return this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });
  }

  async markUsed(id: string): Promise<void> {
    await this.prisma.passwordResetToken.update({
      where: { id },
      data: {
        usedAt: new Date(),
      },
    });
  }
}
