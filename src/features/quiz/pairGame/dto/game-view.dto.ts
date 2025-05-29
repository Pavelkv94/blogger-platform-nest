import { Game } from '../domain/game.entity';
import { AnswerViewDto } from './answer-view.dto';
import { GameStatus } from './game-status';

export class GameViewDto {
  id: string;
  status: string;
  pairCreatedDate: Date;
  startGameDate: Date;
  finishGameDate: Date;
  firstPlayerProgress: any;
  secondPlayerProgress: any = null;
  questions: any = null;

  constructor(model: any, firstPlayerAnswers: AnswerViewDto[], secondPlayerAnswers: AnswerViewDto[]) {
    this.id = model.game_id.toString();
    this.status = model.game_gameStatus;
    this.pairCreatedDate = model.game_pairCreatedDate;
    this.startGameDate = model.game_startGameDate;
    this.finishGameDate = model.game_finishGameDate;
    this.questions = model.status !== GameStatus.PendingSecondPlayer ? model.questions : null;
    this.firstPlayerProgress = {
      player: {
        id: model.firstPlayer_id.toString(),
        login: model.firstPlayer_login,
      },
      score: model.firstPlayer_score,
      answers: firstPlayerAnswers,
    };
    this.secondPlayerProgress = model.secondPlayer_id
      ? {
          player: {
            id: model.secondPlayer_id.toString(),
            login: model.secondPlayer_login,
          },
          score: model.secondPlayer_score,
          answers: secondPlayerAnswers,
        }
      : null;
  }

  static mapToView(game: Game, firstPlayerAnswers: AnswerViewDto[], secondPlayerAnswers: AnswerViewDto[]): GameViewDto {
    return new GameViewDto(game, firstPlayerAnswers, secondPlayerAnswers);
  }
}
