import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserModelType } from '../user-accounts/domain/user.entity';
import { ApiNoContentResponse, ApiOperation } from '@nestjs/swagger';

@Controller('testing')
export class TestingController {
  constructor(@InjectModel('Users') private userModel: UserModelType) {}

  @ApiOperation({ summary: 'Delete all data' }) //swagger
  @ApiNoContentResponse() //swagger
  @Delete('/all-data')
  @HttpCode(204)
  async removeAll() {
    await this.userModel.deleteMany({});
  }
}
