import { CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Column } from 'typeorm';
import { EmailConfirmation } from './email-confirmation.entity';
import { RecoveryConfirmation } from './recovery-confirmation.entity';
import { SecurityDevice } from '../security-device/security-devices.entity';
import { Comment } from '../../../../features/bloggers-platform/comments/domain/comment.entity';
import { Like } from '../../../../features/bloggers-platform/likes/domain/like.entity';

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

@Entity()
//@Unique(['login', 'email']) //todo  2 колонки уникальные
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, collation: 'C' })
  login: string;

  @Column({ unique: true, collation: 'C' })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @OneToOne(() => EmailConfirmation, (emailConfirmation) => emailConfirmation.user)
  emailConfirmation: EmailConfirmation;

  @OneToOne(() => RecoveryConfirmation, (recoveryConfirmation) => recoveryConfirmation.user)
  recoveryConfirmation: RecoveryConfirmation;

  @OneToMany(() => SecurityDevice, (securityDevice) => securityDevice.user)
  securityDevices: SecurityDevice[];

  @OneToMany(() => Comment, (comment) => comment.commentator)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  static buildInstance(login: string, email: string, passwordHash: string): User {
    const user = new this();
    user.login = login;
    user.email = email;
    user.password = passwordHash;
    return user;
  }

  markDeleted() {
    if (this.deletedAt) {
      throw new Error('Entity already deleted');
    }

    this.deletedAt = new Date();
  }
  updatePassword(newPassword: string) {
    this.password = newPassword;
  }
}
