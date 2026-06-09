import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { EmailService } from './email.service';

@Injectable()
export class OutboxWorkerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(OutboxWorkerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  onApplicationBootstrap() {
    setInterval(() => this.processOutbox(), 30_000);
  }

  async processOutbox() {
    const pending = await this.prisma.notification.findMany({
      where: {
        status: 'PENDING',
        OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: new Date() } }],
        attempts: { lt: 5 },
      },
      take: 50,
    });

    for (const notification of pending) {
      try {
        await this.emailService.send({
          toEmail: notification.toEmail,
          type: notification.type,
          payload: notification.payload,
        });
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: { status: 'SENT', sentAt: new Date() },
        });
      } catch (error) {
        this.logger.error(`Failed to send notification ${notification.id}`, error);
        const backoffMs = Math.pow(2, notification.attempts) * 60_000;
        const nextRetry = new Date();
        nextRetry.setMilliseconds(nextRetry.getMilliseconds() + backoffMs);
        const isFinal = notification.attempts >= 4;
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: {
            attempts: { increment: 1 },
            nextRetryAt: nextRetry,
            status: isFinal ? 'FAILED' : 'PENDING',
          },
        });
      }
    }
  }
}
