import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './api/users.controller';
import { UserEntity, UserSchema } from './domain/user.entity';
import { UsersQueryRepository } from './infrastructure/users.query-repository';
import { UsersRepository } from './infrastructure/users.repository';
import { BcryptService } from './application/bcrypt.service';
import { AuthController } from './api/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './application/auth.service';
// import { PassportModule } from '@nestjs/passport';
import { NotificationsModule } from '../notifications/notifications.module';
import { CoreConfig } from 'src/core/core.config';
import { CreateUserUseCase } from './application/usecases/create-user.usecase';
import { DeleteUserUseCase } from './application/usecases/delete-user.usecase';
import { RegisterUserUseCase } from './application/usecases/register-user.usecase';
import { LoginUserUseCase } from './application/usecases/login-user.usecase';
import { SetNewPassUseCase } from './application/usecases/set-new-pass.usecase';
import { ResendEmailUseCase } from './application/usecases/resend-email.usecase';
import { RegisterConfirmUseCase } from './application/usecases/register-confirm.usecase';
import { PassRecoveryUseCase } from './application/usecases/pass-recovery.usecase';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/core/guards/passport/jwt.strategy';
import { LocalStrategy } from './api/guards/passport/local.strategy';

const adapters = [BcryptService]

const useCases = [
  CreateUserUseCase,
  DeleteUserUseCase,
  RegisterUserUseCase,
  LoginUserUseCase,
  SetNewPassUseCase,
  ResendEmailUseCase,
  RegisterConfirmUseCase,
  PassRecoveryUseCase

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
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }]),
    NotificationsModule,
    CqrsModule,
  ],
  exports: [MongooseModule, UsersRepository],
  controllers: [UsersController, AuthController],
  providers: [
    UsersQueryRepository,
    UsersRepository,
    ...adapters,
    AuthService,
    ...useCases,
    LocalStrategy, //* for passport
    JwtStrategy, //* for passport
  ],
})
export class UserAccountsModule {}
