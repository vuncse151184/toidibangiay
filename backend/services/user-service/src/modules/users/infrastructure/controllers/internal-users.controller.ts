import { Controller, Get, Param } from '@nestjs/common';
import { GetMeUseCase } from '../../application/use-cases/get-me.use-case';

@Controller('users/internal')
export class InternalUsersController {
  constructor(private readonly getMe: GetMeUseCase) {}

  @Get(':userId')
  async getByUserId(@Param('userId') userId: string) {
    const user = await this.getMe.execute(userId).catch(() => null);
    if (!user) return null;
    const name =
      user.profile?.fullName ??
      ([user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(' ') ||
      'Khách hàng');
    return { email: user.email, name };
  }
}
