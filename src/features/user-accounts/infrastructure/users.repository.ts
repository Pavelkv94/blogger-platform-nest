import { Injectable } from '@nestjs/common';
import { UserDocument, UserEntity, UserModelType } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DeletionStatus } from 'src/core/dto/deletion-status';
import { BadRequestDomainException, NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';

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

  async findOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.findUserById(id);

    if (!user) {
      throw NotFoundDomainException.create('User not found');
    }

    return user;
  }

  async findUserByLogin(login: string): Promise<boolean> {
    const user = await this.UserModel.findOne({ login, deletionStatus: DeletionStatus.NotDeleted });

    return !!user;
  }

  async findUserByEmail(email: string): Promise<boolean> {
    const user = await this.UserModel.findOne({ email, deletionStatus: DeletionStatus.NotDeleted });

    return !!user;
  }

  async findConfirmationCodeByUserId(userId: string): Promise<string> {
    const user = await this.UserModel.findOne({ _id: userId, deletionStatus: DeletionStatus.NotDeleted });

    if (!user) {
      throw NotFoundDomainException.create('User not found');
    }

    return user.emailConfirmation.confirmationCode;
  }
  async findUserByConfirmationCodeOrBadRequestFail(code: string): Promise<UserDocument> {
    const user = await this.UserModel.findOne({ 'emailConfirmation.confirmationCode': code, deletionStatus: DeletionStatus.NotDeleted });
    if (!user) {
      throw BadRequestDomainException.create('Code doesnt exist', 'code');
    }

    return user;
  }

  async findUserByEmailOrBadRequestFail(email: string): Promise<UserDocument> {
    const user = await this.UserModel.findOne({ email, deletionStatus: DeletionStatus.NotDeleted });
    if (!user) {
      throw BadRequestDomainException.create('User doesnt exist', 'email');
    }

    return user;
  }

  async findUserByRecoveryCodeOrBadRequestFail(code: string): Promise<UserDocument> {
    const user = await this.UserModel.findOne({ 'recoveryConfirmation.recoveryCode': code, deletionStatus: DeletionStatus.NotDeleted });
    if (!user) {
      throw BadRequestDomainException.create('Code not found', 'code');
    }

    return user;
  }
}
