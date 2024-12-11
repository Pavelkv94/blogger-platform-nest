import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './api/users.controller';
import { UserEntity, UserSchema } from './domain/user.entity';
import { UsersService } from './application/users.service';
import { UsersQueryRepository } from './infrastructure/users.query-repository';
import { UsersRepository } from './infrastructure/users.repository';
import { BcryptService } from './application/bcrypt.service';
import { LoginIsExistConstraint } from './validation/login-is-exist.decorator';
import { AuthController } from './api/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './application/auth.service';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule,
    //если в системе несколько токенов (например, access и refresh) с разными опциями (время жизни, секрет)
    //можно переопределить опции при вызове метода jwt.service.sign
    //или написать свой tokens сервис (адаптер), где эти опции будут уже учтены
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET, // секретный ключ
      signOptions: { expiresIn: '60m' }, // Время жизни токена
    }),
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }]),
  ],
  exports: [MongooseModule],
  controllers: [UsersController, AuthController],
  providers: [
    UsersService,
    UsersQueryRepository,
    UsersRepository,
    BcryptService,
    LoginIsExistConstraint,
    AuthService,
    // LocalStrategy, //* for passport
    // JwtStrategy, //* for passport
  ],
})
export class UserAccountsModule {}
