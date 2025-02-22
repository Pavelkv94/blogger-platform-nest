import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';
import { loginConstraints } from '../../domain/user/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'login' })
  @IsString()
  @Length(loginConstraints.minLength, loginConstraints.maxLength)
  @Trim()
  readonly login: string;
  
  @ApiProperty({ example: 'example@example.com' })
  @IsString()
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @Length(6, 10)
  readonly password: string;
}

export class RegistrationInputDto extends CreateUserDto {}
