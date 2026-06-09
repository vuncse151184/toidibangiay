import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { SendNotificationDto } from '../dto/send-notification.dto';

@Injectable()
export class CreateNotificationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: SendNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        toEmail: dto.toEmail,
        type: dto.type as any,
        payload: dto.payload as any,
      },
    });
    return { data: { id: notification.id, status: notification.status } };
  }
}
