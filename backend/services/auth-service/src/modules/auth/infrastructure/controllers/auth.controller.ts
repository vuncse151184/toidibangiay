import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Ip,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

import { env } from '../../../../shared/config/env';
import { PrismaService } from '../../../../shared/database/prisma.service';

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
import { SocialLoginDto } from '../../application/dto/social-login.dto';
import { VerifyEmailDto } from '../../application/dto/verify-email.dto';
import { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { RefreshSessionUseCase } from '../../application/use-cases/refresh-session.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { SocialLoginUseCase } from '../../application/use-cases/social-login.use-case';
import { VerifyEmailUseCase } from '../../application/use-cases/verify-email.use-case';

@ApiTags('auth')
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
    private readonly socialLoginUseCase: SocialLoginUseCase,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  async register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Đăng nhập, nhận access token + refresh token' })
  async login(
    @Body() dto: LoginDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.loginUseCase.execute(dto, { ipAddress, userAgent });
    setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, expiresIn: result.expiresIn, user: result.user };
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Lấy access token mới từ refresh token' })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
    @Headers('cookie') cookieHeader?: string,
  ) {
    const rawToken = dto.refreshToken ?? parseCookie(cookieHeader, REFRESH_COOKIE_NAME);
    const result = await this.refreshSessionUseCase.execute(rawToken ?? '');
    setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, expiresIn: result.expiresIn };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Đăng xuất, revoke refresh token' })
  async logout(
    @Body() dto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
    @Headers('cookie') cookieHeader?: string,
  ) {
    const rawToken = dto.refreshToken ?? parseCookie(cookieHeader, REFRESH_COOKIE_NAME);
    await this.logoutUseCase.execute(rawToken);
    clearRefreshCookie(res);
    return { message: 'Logged out successfully' };
  }

  @Post('social-login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Đăng nhập bằng Google hoặc Facebook OAuth2' })
  async socialLogin(
    @Body() dto: SocialLoginDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.socialLoginUseCase.execute(dto, { ipAddress, userAgent });
    setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, expiresIn: result.expiresIn, user: result.user };
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

  @Get('me')
  @ApiOperation({ summary: 'Lấy thông tin user hiện tại' })
  @ApiBearerAuth()
  async me(@Headers('authorization') authHeader: string | undefined) {
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }
    const token = authHeader.slice(7);
    let payload: { sub: string; email?: string; roles?: string[] };
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: env.JWT_ACCESS_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.prisma.authUser.findUnique({
      where: { id: payload.sub },
    });
    if (!user) throw new UnauthorizedException('User not found');

    const identity = await this.prisma.authIdentity.findUnique({
      where: { userId: payload.sub },
    });

    return {
      id: user.id,
      email: identity?.email ?? null,
      fullName: user.fullName ?? null,
      role: payload.roles?.[0] ?? 'CUSTOMER',
      status: user.status,
    };
  }
}

function parseCookie(header: string | undefined, key: string): string | undefined {
  return header
    ?.split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${key}=`))
    ?.split('=')[1];
}
