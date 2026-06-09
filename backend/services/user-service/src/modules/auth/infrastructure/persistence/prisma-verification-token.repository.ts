import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/database/prisma.service';
import {
  CreateVerificationTokenInput,
  VerificationTokenRecord,
  VerificationTokenRepositoryPort,
} from '../../domain/ports/verification-token.repository.port';

@Injectable()
export class PrismaVerificationTokenRepository
  implements VerificationTokenRepositoryPort
{
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateVerificationTokenInput): Promise<void> {
    await this.prisma.emailVerificationToken.create({
      data: {
        userId: input.userId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      },
    });
  }

  async findByTokenHash(tokenHash: string): Promise<VerificationTokenRecord | null> {
    return this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
    });
  }

  async markUsed(id: string): Promise<void> {
    await this.prisma.emailVerificationToken.update({
      where: { id },
      data: {
        usedAt: new Date(),
      },
    });
  }
}
