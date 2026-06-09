import { Module } from '@nestjs/common';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './shared/database/prisma.module';
import { RedisModule } from './shared/cache/redis.module';

@Module({
  imports: [PrismaModule, RedisModule, AuthModule, UsersModule],
})
export class AppModule {}
