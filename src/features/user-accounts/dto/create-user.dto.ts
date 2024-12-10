import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';
import { loginConstraints, passwordConstraints } from '../domain/user.entity';
import { Trim } from 'src/core/decorators/trim';

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
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  readonly password: string;
}
