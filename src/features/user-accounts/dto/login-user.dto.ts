import { ApiProperty } from '@nestjs/swagger';

export class LoginInputDto {
  readonly loginOrEmail: string;
  readonly password: string;
}

export class LoginOuputDto {
  @ApiProperty({ description: 'Access token of the user', example: 'accessToken' })
  readonly accessToken: string;
}

export class LoginTransferDto {
  readonly userId: string;
  readonly device_id: string;
  readonly ip: string;
  readonly userAgent: string;
}
