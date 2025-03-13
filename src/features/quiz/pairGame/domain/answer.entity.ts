import { Column, CreateDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';
import { Entity } from 'typeorm';
import { Player } from './player.entity';
import { AnswerStatus } from '../dto/answer-status';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  answer: string;

  @Column({ type: 'enum', enum: AnswerStatus })
  answerStatus: string;

  @Column()
  questionId: number;

  @CreateDateColumn()
  addedAt: Date;

  @ManyToOne(() => Player, (player) => player.answers)
  @JoinColumn({ name: 'playerId' })
  player: Player;

  static buildInstance(answer: string, questionId: number): Answer {
    const answerEntity = new Answer();
    answerEntity.answer = answer;
    answerEntity.questionId = questionId;
    answerEntity.answerStatus = AnswerStatus.Correct;
    answerEntity.addedAt = new Date();
    return answerEntity;
  }
}
