import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';
import { Question } from '../../questions/domain/question.entity';
import { Game } from './game.entity';

@Entity()
export class GameQuestions {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Question, (question) => question.gameQuestions)
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @Column()
  questionId: string;

  @ManyToOne(() => Game, (game) => game.gameQuestions)
  @JoinColumn({ name: 'gameId' })
  game: Game;

  @Column()
  gameId: string;

  @Column()
  index: number;

  static buildInstance(gameId: string, questionId: string, index: number): GameQuestions {
    const gameQuestion = new GameQuestions();
    gameQuestion.gameId = gameId;
    gameQuestion.questionId = questionId;
    gameQuestion.index = index;
    return gameQuestion;
  }
}
