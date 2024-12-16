import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { configValidationUtility } from 'src/core/utils/config-validation.utility';

@Injectable()
export class MailerConfig {
  @IsNumber(
    {},
    {
      message: 'Set Env variable SMTP_PORT, example: 587',
    },
  )
  smtp_port: number = Number(this.configService.get('SMTP_PORT')!);

  @IsNotEmpty({
    message: 'Set Env variable SMTP_HOST, example: smtp.gmail.com',
  })
  smtp_host: string = this.configService.get('SMTP_HOST')!;

  @IsNotEmpty({
    message: 'Set Env variable SMTP_USER, example: uykrop@gmail.com',
  })
  smtp_user: string = this.configService.get('SMTP_USER')!;

  @IsNotEmpty({
    message: 'Set Env variable SMTP_PASSWORD, example: mhaq qqai qdgl ahgp',
  })
  smtp_password: string = this.configService.get('SMTP_PASSWORD')!;

  @IsNotEmpty({
    message: 'Set Env variable CLIENT_URL, example: http://localhost:3000',
  })
  client_url: string = this.configService.get('CLIENT_URL')!;

  constructor(private configService: ConfigService) {
    configValidationUtility.validateConfig(this);
  }
}
