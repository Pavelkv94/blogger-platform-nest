import { Injectable } from '@nestjs/common';
import { UserDocument, UserEntity, UserModelType } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DeletionStatus } from 'src/core/dto/deletion-status';

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

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    const userDocument = await this.UserModel.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
      deletionStatus: DeletionStatus.NotDeleted,
    });
    if (!userDocument || !loginOrEmail) {
      return null;
    }

    return userDocument;
  }

  async save(user: UserDocument) {
    await user.save();
  }

  async findUserByLogin(login: string): Promise<boolean> {
    const user = await this.UserModel.findOne({ login, deletionStatus: DeletionStatus.NotDeleted });

    return !!user;
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    const user = await this.UserModel.findOne({ email, deletionStatus: DeletionStatus.NotDeleted });

    if (!user) {
      return null;
    }
    return user;
  }

  async findUserByConfirmationCode(code: string): Promise<UserDocument | null> {
    const user = await this.UserModel.findOne({ 'emailConfirmation.confirmationCode': code, deletionStatus: DeletionStatus.NotDeleted });
    if (!user) {
      return null;
    }

    return user;
  }

  async findUserByRecoveryCode(code: string): Promise<UserDocument | null> {
    const user = await this.UserModel.findOne({ 'recoveryConfirmation.recoveryCode': code, deletionStatus: DeletionStatus.NotDeleted });
    if (!user) {
      return null;
    }

    return user;
  }
}
