import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/database/prisma.service';
import {
  VerificationTokenRecord,
  VerificationTokenRepositoryPort,
} from '../../domain/ports/verification-token.repository.port';

@Injectable()
export class PrismaVerificationTokenRepository implements VerificationTokenRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    await this.prisma.emailVerificationToken.create({ data: input });
  }

  async findByTokenHash(tokenHash: string): Promise<VerificationTokenRecord | null> {
    return this.prisma.emailVerificationToken.findUnique({ where: { tokenHash } });
  }

  async markUsed(id: string): Promise<void> {
    await this.prisma.emailVerificationToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }
}
