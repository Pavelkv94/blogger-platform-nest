import { Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';
import { Entity } from 'typeorm';
import { User } from '../../../user-accounts/domain/user/user.entity';
import { Answer } from './answer.entity';
import { PlayerStatus } from '../dto/player-status';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.players)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => Answer, (answer) => answer.player)
  answers: Answer[];

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ enum: PlayerStatus, nullable: true })
  status: PlayerStatus;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  static buildInstance(userId: string): Player {
    const player = new this();
    player.userId = userId;
    return player;
  }

  markDeleted() {
    this.deletedAt = new Date();
  }

  addScore() {
    this.score += 1;
  }

  setStatus(status: PlayerStatus) {
    this.status = status;
  }

}
