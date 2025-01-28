import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { configValidationUtility } from './utils/config-validation.utility';

export enum Environments {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'testing',
}

// each module has it's own *.config.ts

@Injectable()
export class CoreConfig {
  @IsNumber(
    {},
    {
      message: 'Set Env variable PORT, example: 3000',
    },
  )
  port: number = Number(this.configService.get('PORT'));

  @IsNotEmpty({
    message: 'Set Env variable MONGO_URI, example: mongodb://localhost:27017/my-app-local-db',
  })
  mongoUrl: string = this.configService.get('MONGO_URL');

  @IsNotEmpty({
    message: 'Set Env variable DB_NAME, example: my-app-local-db',
  })
  dbName: string = this.configService.get('DB_NAME');

  @IsNotEmpty({
    message: 'Set Env variable DB_HOST, example: localhost',
  })
  dbHost: string = this.configService.get('DB_HOST');

  @IsNotEmpty({
    message: 'Set Env variable DB_PORT, example: 5432',
  })
  dbPort: number = Number(this.configService.get('DB_PORT'));


  @IsNotEmpty({
    message: 'Set Env variable DB_USERNAME, example: admin',
  })
  dbUsername: string = this.configService.get('DB_USERNAME');

  @IsNotEmpty({
    message: 'Set Env variable DB_PASSWORD, example: admin',
  })
  dbPassword: string = this.configService.get('DB_PASSWORD');

  @IsEnum(Environments, {
    message: 'Ser correct NODE_ENV value, available values: ' + configValidationUtility.getEnumValues(Environments).join(', '),
  })
  env: string = this.configService.get('NODE_ENV');

  @IsBoolean({
    message: 'Set Env variable IS_SWAGGER_ENABLED to enable/disable Swagger, example: true, available values: true, false',
  })
  isSwaggerEnabled = configValidationUtility.convertToBoolean(this.configService.get('IS_SWAGGER_ENABLED')) as boolean;

  @IsBoolean({
    message: 'Set Env variable INCLUDE_TESTING_MODULE to enable/disable Dangerous for production TestingModule, example: true, available values: true, false, 0, 1',
  })
  includeTestingModule: boolean = configValidationUtility.convertToBoolean(this.configService.get('INCLUDE_TESTING_MODULE')) as boolean;

  @IsNotEmpty({
    message: 'Set Env variable JWT_REFRESH_SECRET, dangerous for security!',
  })
  refreshTokenSecret: string = this.configService.get('JWT_REFRESH_SECRET');

  @IsNotEmpty({
    message: 'Set Env variable JWT_ACCESS_SECRET, dangerous for security!',
  })
  accessTokenSecret: string = this.configService.get('JWT_ACCESS_SECRET');

  @IsNotEmpty({
    message: 'Set Env variable JWT_ACCESS_EXPIRATION_TIME, dangerous for security!',
  })
  accessTokenExpirationTime: string = this.configService.get('JWT_ACCESS_EXPIRATION_TIME');

  @IsNotEmpty({
    message: 'Set Env variable JWT_REFRESH_EXPIRATION_TIME, dangerous for security!',
  })
  refreshTokenExpirationTime: string = this.configService.get('JWT_REFRESH_EXPIRATION_TIME');

  constructor(private configService: ConfigService<any, true>) {
    configValidationUtility.validateConfig(this);
  }
}
