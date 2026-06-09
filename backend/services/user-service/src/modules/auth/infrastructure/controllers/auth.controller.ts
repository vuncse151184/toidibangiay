import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Ip,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

import {
  clearRefreshCookie,
  REFRESH_COOKIE_NAME,
  setRefreshCookie,
} from '../../../../shared/security/cookie.util';
import { ForgotPasswordDto } from '../../application/dto/forgot-password.dto';
import { LoginDto } from '../../application/dto/login.dto';
import { RefreshTokenDto } from '../../application/dto/refresh-token.dto';
import { RegisterDto } from '../../application/dto/register.dto';
import { ResetPasswordDto } from '../../application/dto/reset-password.dto';
import { VerifyEmailDto } from '../../application/dto/verify-email.dto';
import { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { RefreshSessionUseCase } from '../../application/use-cases/refresh-session.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { VerifyEmailUseCase } from '../../application/use-cases/verify-email.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.loginUseCase.execute(dto, {
      ipAddress,
      userAgent,
    });

    setRefreshCookie(response, result.refreshToken);

    return {
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      user: result.user,
    };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Res({ passthrough: true }) response: Response,
    @Headers('cookie') cookieHeader?: string,
  ) {
    const refreshToken =
      dto.refreshToken ||
      extractCookieValue(cookieHeader, REFRESH_COOKIE_NAME);

    const result = await this.refreshSessionUseCase.execute(refreshToken ?? '');
    setRefreshCookie(response, result.refreshToken);

    return {
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(
    @Body() dto: RefreshTokenDto,
    @Res({ passthrough: true }) response: Response,
    @Headers('cookie') cookieHeader?: string,
  ) {
    const refreshToken =
      dto.refreshToken ||
      extractCookieValue(cookieHeader, REFRESH_COOKIE_NAME);

    await this.logoutUseCase.execute(refreshToken);
    clearRefreshCookie(response);

    return { message: 'Logged out successfully' };
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.forgotPasswordUseCase.execute(dto);
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.resetPasswordUseCase.execute(dto);
  }

  @Post('verify-email')
  @HttpCode(200)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.verifyEmailUseCase.execute(dto);
  }
}

function extractCookieValue(cookieHeader: string | undefined, key: string): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  const cookie = cookieHeader
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${key}=`));

  return cookie?.split('=')[1];
}
