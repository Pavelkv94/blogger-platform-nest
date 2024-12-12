import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DeletionStatus } from 'src/core/dto/deletion-status';
import { randomUUID } from 'crypto';
import { getExpirationDate } from 'src/core/utils/date/getExpirationDate';

interface EmailConfirmation {
  confirmationCode: string;
  expirationDate: string;
  isConfirmed: boolean;
}

interface RecoveryConfirmation {
  recoveryCode: string;
  expirationDate: string;
}

const EmailConfirmationSchema = {
  confirmationCode: { type: String, required: true },
  expirationDate: { type: String, required: true },
  isConfirmed: { type: Boolean, required: true },
};

const RecoveryConfirmationSchema = {
  recoveryCode: { type: String, required: false, default: null },
  expirationDate: { type: String, required: false, default: null },
};

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

  @Prop({
    type: EmailConfirmationSchema,
    required: true,
    default: {
      confirmationCode: null,
      expirationDate: null,
      isConfirmed: false,
    },
  })
  emailConfirmation: EmailConfirmation;

  @Prop({
    type: RecoveryConfirmationSchema,
    required: true,
    default: {
      recoveryCode: null,
      expirationDate: null,
    },
  })
  recoveryConfirmation: RecoveryConfirmation;

  static buildInstance(login: string, email: string, passwordHash: string): UserDocument {
    const user = new this(); //UserModel!

    user.email = email;
    user.password = passwordHash;
    user.login = login;

    user.emailConfirmation.confirmationCode = randomUUID();
    user.emailConfirmation.expirationDate = getExpirationDate(30);

    return user as UserDocument;
  }

  makeDeleted() {
    if (this.deletionStatus !== DeletionStatus.NotDeleted) {
      throw new Error('Entity already deleted');
    }
    this.deletionStatus = DeletionStatus.PermanentDeleted;
  }

  confirmRegistration() {
    this.emailConfirmation.isConfirmed = true;
  }

  generateNewConfirmationCode() {
    this.emailConfirmation.confirmationCode = randomUUID();
    this.emailConfirmation.expirationDate = getExpirationDate(30);
  }

  generateNewRecoveryCode() {
    this.recoveryConfirmation.recoveryCode = randomUUID();
    this.recoveryConfirmation.expirationDate = getExpirationDate(30);
  }

  setNewPassword(newPassword: string) {
    this.password = newPassword;
  }
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);

UserSchema.loadClass(UserEntity);

export type UserDocument = HydratedDocument<UserEntity>;

export type UserModelType = Model<UserDocument> & typeof UserEntity;
