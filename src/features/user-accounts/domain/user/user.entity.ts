import { Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { Column } from "typeorm";
import { Profile } from "./profile.entity";
import { Wallet } from "./wallet.entity";

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  login: string;

  //* не обязательное поле, для того чтобы понимать что пользователь связан с профилем
  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @OneToMany(() => Wallet, (wallet) => wallet.owner)
  wallets: Wallet[];
}


//   @Prop({ type: String, required: true, unique: true })
//   email: string;

//   @Prop({ type: String, required: true })
//   password: string;

//   @Prop({ type: Date })
//   createdAt: Date;

//   @Prop({ enum: DeletionStatus, default: DeletionStatus.NotDeleted })
//   deletionStatus: DeletionStatus;

//   @Prop({ type: EmailConfirmationSchema, required: true, default: {
//     confirmationCode: null,
//     expirationDate: null,
//     isConfirmed: false,
//   } })
//   emailConfirmation: EmailConfirmation;

//   @Prop({ type: RecoveryConfirmationSchema, required: true, default: {
//     recoveryCode: null,
//     expirationDate: null,
//   } })
//   recoveryConfirmation: RecoveryConfirmation;

//   static buildInstance(login: string, email: string, passwordHash: string): UserDocument {
//     const user = new this(); //UserModel!

//     user.email = email;
//     user.password = passwordHash;
//     user.login = login;

//     user.emailConfirmation.confirmationCode = randomUUID();
//     user.emailConfirmation.expirationDate = getExpirationDate(30);

//     return user as UserDocument;
//   }

//   makeDeleted() {
//     if (this.deletionStatus !== DeletionStatus.NotDeleted) {
//       throw new Error('Entity already deleted');
//     }
//     this.deletionStatus = DeletionStatus.PermanentDeleted;
//   }

//   confirmRegistration() {
//     this.emailConfirmation.isConfirmed = true;
//   }

//   generateNewConfirmationCode() {
//     this.emailConfirmation.confirmationCode = randomUUID();
//     this.emailConfirmation.expirationDate = getExpirationDate(30);
//   }

//   generateNewRecoveryCode() {
//     this.recoveryConfirmation.recoveryCode = randomUUID();
//     this.recoveryConfirmation.expirationDate = getExpirationDate(30);
//   }

//   setNewPassword(newPassword: string) {
//     this.password = newPassword;
//   }
// }

// export const UserSchema = SchemaFactory.createForClass(UserEntity);

// UserSchema.loadClass(UserEntity);

// export type UserDocument = HydratedDocument<UserEntity>;

// export type UserModelType = Model<UserDocument> & typeof UserEntity;

// export type UserEntityType = {
//   id: string;
//   login: string;
//   email: string;
//   password: string;
//   created_at: Date;
//   deleted_at: Date;
// };
