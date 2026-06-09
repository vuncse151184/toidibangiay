import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { JwtAuthGuard } from '../../shared/http/jwt-auth.guard';
import { RolesGuard } from '../../shared/http/roles.guard';
import { PrismaOutboxEventBusAdapter } from '../../shared/events/prisma-outbox-event-bus.adapter';
import { EVENT_BUS } from '../../shared/events/event-bus.port';
import { UsersController } from './infrastructure/controllers/users.controller';
import { InternalUsersController } from './infrastructure/controllers/internal-users.controller';
import { PrismaAddressRepository } from './infrastructure/persistence/prisma-address.repository';
import { PrismaUserReadRepository } from './infrastructure/persistence/prisma-user-read.repository';
import { ADDRESS_REPOSITORY, AddressRepositoryPort } from './domain/ports/address.repository.port';
import { USER_READ_REPOSITORY, UserReadRepositoryPort } from './domain/ports/user-read.repository.port';
import { CreateMyAddressUseCase } from './application/use-cases/create-my-address.use-case';
import { GetMeUseCase } from './application/use-cases/get-me.use-case';
import { ListMyAddressesUseCase } from './application/use-cases/list-my-addresses.use-case';
import { UpdateMeUseCase } from './application/use-cases/update-me.use-case';

@Module({
  imports: [JwtModule.register({})],
  controllers: [UsersController, InternalUsersController],
  providers: [
    GetMeUseCase,
    UpdateMeUseCase,
    ListMyAddressesUseCase,
    CreateMyAddressUseCase,
    JwtAuthGuard,
    RolesGuard,
    {
      provide: USER_READ_REPOSITORY,
      useClass: PrismaUserReadRepository,
    },
    {
      provide: ADDRESS_REPOSITORY,
      useClass: PrismaAddressRepository,
    },
    {
      provide: EVENT_BUS,
      useClass: PrismaOutboxEventBusAdapter,
    },
    PrismaUserReadRepository,
    PrismaAddressRepository,
  ],
})
export class UsersModule {}
