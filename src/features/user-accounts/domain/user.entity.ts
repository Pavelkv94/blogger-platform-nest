import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DeletionStatus } from 'src/core/dto/deletion-status';

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

@Schema({ timestamps: true })
export class UserEntity {
  @Prop({ type: String, required: true, ...loginConstraints })
  login: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ enum: DeletionStatus, default: DeletionStatus.NotDeleted })
  deletionStatus: DeletionStatus;

  static buildInstance(login: string, email: string, passwordHash: string): UserDocument {
    const user = new this(); //UserModel!

    user.email = email;
    user.password = passwordHash;
    user.login = login;

    return user as UserDocument;
  }

  makeDeleted() {
    if (this.deletionStatus !== DeletionStatus.NotDeleted) {
      throw new Error('Entity already deleted');
    }
    this.deletionStatus = DeletionStatus.PermanentDeleted;
  }
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);

UserSchema.loadClass(UserEntity);

export type UserDocument = HydratedDocument<UserEntity>;

export type UserModelType = Model<UserDocument> & typeof UserEntity;
