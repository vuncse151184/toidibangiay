import { Module } from '@nestjs/common';
import { EmailService } from './application/services/email.service';
import { OutboxWorkerService } from './application/services/outbox-worker.service';
import { CreateNotificationUseCase } from './application/use-cases/create-notification.use-case';
import { NotificationController } from './infrastructure/controllers/notification.controller';

@Module({
  controllers: [NotificationController],
  providers: [EmailService, OutboxWorkerService, CreateNotificationUseCase],
})
export class NotificationModule {}
