import { Game } from '../domain/game.entity';

export class GameViewDto {
  id: string;
  status: string;
  pairCreatedDate: Date;
  startGameDate: Date;
  finishGameDate: Date;
  firstPlayerProgress: any;
  secondPlayerProgress: any = null;
  questions: any = null;

  constructor(model: any) {
    this.id = model.game_id.toString();
    this.status = model.game_gameStatus;
    this.pairCreatedDate = model.game_pairCreatedDate;
    this.startGameDate = model.game_startGameDate;
    this.finishGameDate = model.game_finishGameDate;
    this.questions = model.secondPlayer_id ? model.questions : null;
    this.firstPlayerProgress = {
      player: {
        id: model.firstPlayer_id.toString(),
        login: model.firstPlayer_login,
      },
      score: model.firstPlayer_score,
      answers: [],
    };
    this.secondPlayerProgress = model.secondPlayer_id
      ? {
          player: {
            id: model.secondPlayer_id.toString(),
            login: model.secondPlayer_login,
          },
          score: model.secondPlayer_score,
          answers: [],
        }
      : null;
  }

  static mapToView(game: Game): GameViewDto {
    return new GameViewDto(game);
  }
}
