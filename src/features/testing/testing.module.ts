import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestingController } from './testing.controller';
import { UserSchema } from '../user-accounts/domain/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Testing') //swagger
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Users', schema: UserSchema }
    ])
  ],
  controllers: [TestingController],
  providers: []
})
export class TestingModule {}
