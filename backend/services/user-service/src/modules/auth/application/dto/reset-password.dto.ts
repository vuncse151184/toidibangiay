import { IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message:
      'newPassword must contain upper, lower, digit, and special character',
  })
  newPassword!: string;
}
