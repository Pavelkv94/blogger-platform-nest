import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './api/users.controller';
import { BcryptService } from './application/bcrypt.service';
import { AuthController } from './api/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './application/auth.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { CoreConfig } from 'src/core/core.config';
import { CreateUserUseCase } from './application/usecases/users/create-user.usecase';
import { DeleteUserUseCase } from './application/usecases/users/delete-user.usecase';
import { RegisterUserUseCase } from './application/usecases/users/register-user.usecase';
import { LoginUserUseCase } from './application/usecases/users/login-user.usecase';
import { SetNewPassUseCase } from './application/usecases/users/set-new-pass.usecase';
import { ResendEmailUseCase } from './application/usecases/users/resend-email.usecase';
import { RegisterConfirmUseCase } from './application/usecases/users/register-confirm.usecase';
import { PassRecoveryUseCase } from './application/usecases/users/pass-recovery.usecase';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { JwtAccessStrategy } from 'src/core/guards/passport/jwt-access.strategy';
import { LocalStrategy } from './api/guards/passport/local.strategy';
import { UserEntity, UserSchema } from './domain/user/user.entity';
import { UsersRepository } from './infrastructure/users/users.repository';
import { UsersQueryRepository } from './infrastructure/users/users.query-repository';
import { SecurityDevicesController } from './api/security-devices.controller';
import { AddSecurityDeviceUseCase } from './application/usecases/security-devices/add-device.usecase';
import { SecurityDevicesQueryRepository } from './infrastructure/security-devices/security-devices.query-repository';
import { SecurityDevicesRepository } from './infrastructure/security-devices/security-devices.repository';
import { SecurityDeviceEntity, SecurityDeviceSchema } from './domain/security-device/security-devices.schema';
import { RefreshTokenUserUseCase } from './application/usecases/users/refresh-token.usecase';
import { JwtRefreshAuthPassportStrategy } from 'src/core/guards/passport/jwt-refresh.strategy';
import { UpdateSecurityDeviceUseCase } from './application/usecases/security-devices/update-device.usecase';
import { DeleteSecurityDeviceUseCase } from './application/usecases/security-devices/delete-device.usecase';
import { DeleteOtherSecurityDevicesUseCase } from './application/usecases/security-devices/delete-devices.usecase';

const adapters = [BcryptService];

const repositories = [UsersQueryRepository, UsersRepository, SecurityDevicesQueryRepository, SecurityDevicesRepository];

const useCases = [
  CreateUserUseCase,
  DeleteUserUseCase,
  RegisterUserUseCase,
  LoginUserUseCase,
  SetNewPassUseCase,
  ResendEmailUseCase,
  RegisterConfirmUseCase,
  PassRecoveryUseCase,
  AddSecurityDeviceUseCase,
  RefreshTokenUserUseCase,
  UpdateSecurityDeviceUseCase,
  DeleteSecurityDeviceUseCase,
  DeleteOtherSecurityDevicesUseCase
];

@Module({
  imports: [
    PassportModule, //* for passport
    //если в системе несколько токенов (например, access и refresh) с разными опциями (время жизни, секрет)
    //можно переопределить опции при вызове метода jwt.service.sign
    //или написать свой tokens сервис (адаптер), где эти опции будут уже учтены
    JwtModule.registerAsync({
      useFactory: (coreConfig: CoreConfig) => ({
        secret: coreConfig.accessTokenSecret,
      }),
      inject: [CoreConfig],
    }),
    MongooseModule.forFeature([
      { name: UserEntity.name, schema: UserSchema },
      { name: SecurityDeviceEntity.name, schema: SecurityDeviceSchema },
    ]),
    NotificationsModule,
    CqrsModule,
  ],
  exports: [MongooseModule, UsersRepository],
  controllers: [UsersController, AuthController, SecurityDevicesController],
  providers: [
    ...repositories,
    ...adapters,
    AuthService,
    ...useCases,
    LocalStrategy, //* for passport
    JwtAccessStrategy, //* for passport
    JwtRefreshAuthPassportStrategy
  ],
})
export class UserAccountsModule {}
