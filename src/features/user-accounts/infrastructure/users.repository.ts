import { Injectable, NotFoundException } from '@nestjs/common';
import { UserDocument, UserEntity, UserModelType } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(UserEntity.name) private UserModel: UserModelType) {}

  async findUserById(id: string): Promise<UserDocument | null> {
    const userDocument = await this.UserModel.findOne({ _id: id });
    if (!userDocument) {
      return null;
    }

    return userDocument;
  }

  async save(user: UserDocument) {
    await user.save();
  }

  async findOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.findUserById(id);

    if (!user) {
      //TODO: replace with domain exception
      throw new NotFoundException('user not found');
    }

    return user;
  }
}
