import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/database/prisma.service';
import {
  AuditLogCreateInput,
  AuditLoginLogRepositoryPort,
} from '../../domain/ports/audit-login-log.repository.port';

@Injectable()
export class PrismaAuditLoginLogRepository
  implements AuditLoginLogRepositoryPort
{
  constructor(private readonly prisma: PrismaService) {}

  async createSuccess(input: AuditLogCreateInput): Promise<void> {
    await this.prisma.auditLoginLog.create({
      data: {
        userId: input.userId,
        identityEmail: input.identityEmail,
        success: true,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  }

  async createFail(input: AuditLogCreateInput): Promise<void> {
    await this.prisma.auditLoginLog.create({
      data: {
        userId: input.userId,
        identityEmail: input.identityEmail,
        success: false,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        failureReason: input.failureReason,
      },
    });
  }
}
