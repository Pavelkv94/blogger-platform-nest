import { Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Column } from 'typeorm';
import { User } from './user.entity';
import { randomUUID } from 'crypto';
import { getExpirationDate } from '../../../../core/utils/date/getExpirationDate';

@Entity()
export class EmailConfirmation {
  @PrimaryColumn()
  userId: number;

  @Column()
  confirmationCode: string;

  @Column({ type: 'boolean', default: false })
  isConfirmed: boolean;

  @Column({ type: 'timestamptz' })
  expirationDate: Date;

  @OneToOne(() => User, (user) => user.emailConfirmation)
  @JoinColumn({ name: 'userId' })
  user: User;

  static buildInstance(userId: number): EmailConfirmation {
    const emailConfirmation = new this();
    emailConfirmation.userId = userId;
    emailConfirmation.confirmationCode = randomUUID();
    emailConfirmation.expirationDate = getExpirationDate(30);
    return emailConfirmation;
  }

  markConfirmed() {
    this.isConfirmed = true;
  }

  setNewCode(confirmationCode: string, expirationDate: Date) {
    this.confirmationCode = confirmationCode;
    this.expirationDate = expirationDate;
  }
}
