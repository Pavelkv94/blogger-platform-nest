// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { IsNotEmpty } from 'class-validator';
// import { configValidationUtility } from 'src/core/utils/config-validation.utility';

// // each module has it's own *.config.ts

//! не работает, как сделать?
// @Injectable()
// export class UserAccountsConfig {
//   @IsNotEmpty({
//     message: 'Set Env variable JWT_ACCESS_SECRET, dangerous for security!',
//   })
//   accessTokenSecret: string = this.configService.get('JWT_ACCESS_SECRET');

//   @IsNotEmpty({
//     message: 'Set Env variable JWT_REFRESH_SECRET, dangerous for security!',
//   })
//   refreshTokenSecret: string = this.configService.get('JWT_REFRESH_SECRET');

//   @IsNotEmpty({
//     message: 'Set Env variable JWT_ACCESS_EXPIRATION_TIME, dangerous for security!',
//   })
//   accessTokenExpirationTime: string = this.configService.get('JWT_ACCESS_EXPIRATION_TIME');

//   @IsNotEmpty({
//     message: 'Set Env variable JWT_REFRESH_EXPIRATION_TIME, dangerous for security!',
//   })
//   refreshTokenExpirationTime: string = this.configService.get('JWT_REFRESH_EXPIRATION_TIME');

//   constructor(private configService: ConfigService<any, true>) {
//     configValidationUtility.validateConfig(this);
//   }
// }
