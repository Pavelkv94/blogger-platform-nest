import { Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

import { Column } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class RecoveryConfirmation {
  @PrimaryColumn()
  userId: number;

  @Column({ nullable: true })
  recoveryCode: string;

  @Column({ type: 'timestamptz', nullable: true })
  recoveryExpirationDate: Date;

  @OneToOne(() => User, (user) => user.recoveryConfirmation)
  @JoinColumn({ name: 'userId' })
  user: User;

  static buildInstance(userId: number): RecoveryConfirmation {
    const recoveryConfirmation = new this();
    recoveryConfirmation.userId = userId;
    return recoveryConfirmation;
  }

  setNewCode(recoveryCode: string, recoveryExpirationDate: Date) {
    this.recoveryCode = recoveryCode;
    this.recoveryExpirationDate = recoveryExpirationDate;
  }
}
