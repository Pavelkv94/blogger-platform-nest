import { Column, CreateDateColumn, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';
import { Entity } from 'typeorm';
import { GameQuestions } from './game-questions.entity';
import { GameStatus } from '../dto/game-status';
import { Player } from './player.entity';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  firstPlayerId: string;

  @Column({ nullable: true })
  secondPlayerId: string;

  @OneToOne(() => Player)
  @JoinColumn({ name: 'firstPlayerId' })
  firstPlayer: Player;

  @OneToOne(() => Player)
  @JoinColumn({ name: 'secondPlayerId' })
  secondPlayer: Player;

  @OneToMany(() => GameQuestions, (gameQuestions) => gameQuestions.game)
  gameQuestions: GameQuestions[];

  @Column({ type: 'enum', enum: GameStatus })
  gameStatus: GameStatus;

  @CreateDateColumn()
  pairCreatedDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  startGameDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  finishGameDate: Date;

  @OneToMany(() => GameQuestions, (gameQuestions) => gameQuestions.game)
  questions: GameQuestions[];

  static buildInstance(userId: string): Game {
    const game = new this();
    game.firstPlayerId = userId;
    game.gameStatus = GameStatus.PendingSecondPlayer;
    return game;
  }

  connectSecondPlayer(userId: string) {
    this.secondPlayerId = userId;
  }

  startGame() {
    this.gameStatus = GameStatus.Active;
    this.startGameDate = new Date();
  }
}
