import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser, CurrentUserData } from '../../../../shared/http/current-user.decorator';
import { JwtAuthGuard } from '../../../../shared/http/jwt-auth.guard';
import { CreateAddressDto } from '../../application/dto/create-address.dto';
import { UpdateMeDto } from '../../application/dto/update-me.dto';
import { CreateMyAddressUseCase } from '../../application/use-cases/create-my-address.use-case';
import { GetMeUseCase } from '../../application/use-cases/get-me.use-case';
import { ListMyAddressesUseCase } from '../../application/use-cases/list-my-addresses.use-case';
import { UpdateMeUseCase } from '../../application/use-cases/update-me.use-case';

@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly getMeUseCase: GetMeUseCase,
    private readonly updateMeUseCase: UpdateMeUseCase,
    private readonly listMyAddressesUseCase: ListMyAddressesUseCase,
    private readonly createMyAddressUseCase: CreateMyAddressUseCase,
  ) {}

  @Get()
  async getMe(@CurrentUser() user: CurrentUserData) {
    return this.getMeUseCase.execute(user.userId);
  }

  @Patch()
  async updateMe(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdateMeDto,
  ) {
    return this.updateMeUseCase.execute(user.userId, dto);
  }

  @Get('addresses')
  async listMyAddresses(@CurrentUser() user: CurrentUserData) {
    return this.listMyAddressesUseCase.execute(user.userId);
  }

  @Post('addresses')
  async createAddress(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateAddressDto,
  ) {
    return this.createMyAddressUseCase.execute(user.userId, dto);
  }
}
