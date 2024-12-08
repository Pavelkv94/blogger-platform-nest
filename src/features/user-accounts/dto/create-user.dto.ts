import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'login' })
  login: string;
  @ApiProperty({ example: 'example@example.com' })
  email: string;
  @ApiProperty({ example: '12345678' })
  password: string;
}
