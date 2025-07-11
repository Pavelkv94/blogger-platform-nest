import { Column, CreateDateColumn, OneToMany } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';
import { Entity } from 'typeorm';
import { GameQuestions } from '../../pairGame/domain/game-questions.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ collation: 'C' })
  body: string;

  @Column({ type: 'jsonb' })
  correctAnswers: Array<string | number>;

  @Column({ default: false })
  published: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @OneToMany(() => GameQuestions, (gameQuestions) => gameQuestions.question)
  gameQuestions: GameQuestions[];

  static buildInstance(body: string, correctAnswers: Array<string | number>): Question {
    const question = new this();
    question.body = body;
    question.correctAnswers = correctAnswers;
    return question;
  }

  markDeleted() {
    this.deletedAt = new Date();
  }

  update(body: string, correctAnswers: Array<string | number>) {
    this.body = body;
    this.correctAnswers = correctAnswers;
    this.updatedAt = new Date();
  }

  setPublishStatus(published: boolean) {
    this.published = published;
    this.updatedAt = new Date();
  }
}
