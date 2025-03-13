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

  // @OneToOne(() => Game, (game) => game.firstPlayer)
  // firstPlayer: Game;

  // firstPlayerId: number;

  // @OneToOne(() => Game, (game) => game.secondPlayer)
  // secondPlayer: Game;

  // secondPlayerId: number;

  // @OneToMany(() => Question, (question) => question.game)
  // questions: Question[];

  static buildInstance(userId: string): Player {
    const player = new this();
    player.userId = userId;
    return player;
  }

  markDeleted() {
    this.deletedAt = new Date();
  }

  // update(body: string, correctAnswers: Array<string | number>) {
  //   this.body = body;
  //   this.correctAnswers = correctAnswers;
  // }

  // setPublishStatus(published: boolean) {
  //   this.published = published;
  // }
}
