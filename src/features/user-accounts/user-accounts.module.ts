import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './api/users.controller';
import { UserEntity, UserSchema } from './domain/user.entity';
import { UsersService } from './application/users.service';
import { UsersQueryRepository } from './infrastructure/users.query-repository';
import { UsersRepository } from './infrastructure/users.repository';
import { BcryptService } from './application/bcrypt.service';
import { LoginIsExistConstraint } from './validation/login-is-exist.decorator';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }])],
  exports: [MongooseModule],
  controllers: [UsersController],
  providers: [UsersService, UsersQueryRepository, UsersRepository, BcryptService, LoginIsExistConstraint],
})
export class UserAccountsModule {}
