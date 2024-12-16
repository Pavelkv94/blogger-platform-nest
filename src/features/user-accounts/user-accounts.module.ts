import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './api/users.controller';
import { UserEntity, UserSchema } from './domain/user.entity';
import { UsersService } from './application/users.service';
import { UsersQueryRepository } from './infrastructure/users.query-repository';
import { UsersRepository } from './infrastructure/users.repository';
import { BcryptService } from './application/bcrypt.service';
import { AuthController } from './api/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './application/auth.service';
// import { PassportModule } from '@nestjs/passport';
import { NotificationsModule } from '../notifications/notifications.module';
import { CoreConfig } from 'src/core/core.config';

@Module({
  imports: [
    // PassportModule,
    //если в системе несколько токенов (например, access и refresh) с разными опциями (время жизни, секрет)
    //можно переопределить опции при вызове метода jwt.service.sign
    //или написать свой tokens сервис (адаптер), где эти опции будут уже учтены
    JwtModule.registerAsync({
      useFactory: (coreConfig: CoreConfig) => ({
        secret: coreConfig.accessTokenSecret,
        signOptions: { expiresIn: '5s' },
      }),
      inject: [CoreConfig],
    }),
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }]),
    NotificationsModule,
  ],
  exports: [MongooseModule],
  controllers: [UsersController, AuthController],
  providers: [
    UsersService,
    UsersQueryRepository,
    UsersRepository,
    BcryptService,
    AuthService,
    // LocalStrategy, //* for passport
    // JwtStrategy, //* for passport
  ],
})
export class UserAccountsModule {}
