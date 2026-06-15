import { IsIn, IsString, MinLength } from 'class-validator';

export class SocialLoginDto {
  @IsIn(['google', 'facebook'])
  provider: 'google' | 'facebook';

  @IsString()
  @MinLength(10)
  token: string;
}
