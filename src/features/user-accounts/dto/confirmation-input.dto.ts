import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class RegistrationConfirmationInputDto {
  @ApiProperty({ example: 'asdasda-asdasd-1231232-asdasdasd' })
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class ResendConfirmationInputDto {
  @ApiProperty({ example: 'example@example.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
export class PasswordRecoveryInputDto extends ResendConfirmationInputDto {}

export class NewPasswordInputDto extends RegistrationConfirmationInputDto {
  @ApiProperty({ example: '12345678' })
  @IsString()
  @Length(6, 10)
  @IsNotEmpty()
  newPassword: string;
}
