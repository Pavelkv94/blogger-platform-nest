import { Injectable } from '@nestjs/common';
import { UserDocument, UserEntity, UserModelType } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DeletionStatus } from 'src/core/dto/deletion-status';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(UserEntity.name) private UserModel: UserModelType) {}

  async findUserById(id: string): Promise<UserDocument | null> {
    const userDocument = await this.UserModel.findOne({ _id: id, deletionStatus: DeletionStatus.NotDeleted });
    if (!userDocument || !id) {
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
      throw NotFoundDomainException.create('User not found');
    }

    return user;
  }

  async loginIsExist(login: string): Promise<boolean> {
    const user = await this.UserModel.findOne({ login });
    return !!user;
  }
}
