import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/database/prisma.service';
import { AuditLogRepositoryPort } from '../../domain/ports/audit-log.repository.port';

@Injectable()
export class PrismaAuditLogRepository implements AuditLogRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async logSuccess(input: {
    userId: string;
    identityEmail: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.prisma.auditLoginLog.create({
      data: { ...input, success: true },
    });
  }

  async logFailure(input: {
    userId?: string;
    identityEmail: string;
    failureReason: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.prisma.auditLoginLog.create({
      data: { ...input, success: false },
    });
  }
}
