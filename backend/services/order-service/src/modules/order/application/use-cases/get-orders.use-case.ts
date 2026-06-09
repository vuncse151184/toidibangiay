import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service';

@Injectable()
export class GetOrdersUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, page = 1, limit = 10) {
    const where = userId === 'admin' ? {} : { userId };
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { items: true, events: { orderBy: { createdAt: 'asc' } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);
    return { data: orders, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
