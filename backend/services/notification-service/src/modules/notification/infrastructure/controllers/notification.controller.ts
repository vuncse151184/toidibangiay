import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SendNotificationDto } from '../../application/dto/send-notification.dto';
import { CreateNotificationUseCase } from '../../application/use-cases/create-notification.use-case';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly createNotification: CreateNotificationUseCase) {}

  @Post()
  create(@Body() dto: SendNotificationDto) { return this.createNotification.execute(dto); }

  @Get('health')
  health() { return { status: 'ok', service: 'notification-service' }; }
}
