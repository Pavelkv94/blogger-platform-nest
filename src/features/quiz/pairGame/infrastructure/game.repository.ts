import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../domain/game.entity';
import { GameStatus } from '../dto/game-status';

@Injectable()
export class GameRepository {
  constructor(@InjectRepository(Game) private gameRepositoryTypeOrm: Repository<Game>) { }

  async findGameByUserId(userId: string): Promise<Game | null> {
    const game = await this.gameRepositoryTypeOrm.findOne({ where: { firstPlayerId: userId } });
    return game;
  }

  async findGameById(gameId: string): Promise<Game | null> {
    const game = await this.gameRepositoryTypeOrm.findOne({ where: { id: +gameId } });
    return game;
  }

  async findAvailableGamePair(): Promise<Game | null> {
    const game = await this.gameRepositoryTypeOrm.findOne({ where: { gameStatus: GameStatus.PendingSecondPlayer } });
    return game;
  }

  async createGamePair(playerId: string): Promise<string> {
    const game = Game.buildInstance(playerId);
    const newGame = await this.gameRepositoryTypeOrm.save(game);
    return newGame.id.toString();
  }

  async connectToGamePair(playerId: string, game: Game): Promise<string> {
    game.connectSecondPlayer(playerId);
    await this.gameRepositoryTypeOrm.save(game);
    return game.id.toString();
  }

  async startGame(game: Game): Promise<void> {
    game.startGame();
    await this.gameRepositoryTypeOrm.save(game);
  }

  async finishGame(game: Game): Promise<void> {
    game.finishGame();
    await this.gameRepositoryTypeOrm.save(game);
  }

  async findAllGames(): Promise<any[]> {
    const gameQueryBuilder = this.gameRepositoryTypeOrm
      .createQueryBuilder('game')
      .leftJoin('game.firstPlayer', 'firstPlayer')
      .leftJoin('game.secondPlayer', 'secondPlayer')
      .leftJoin('firstPlayer.user', 'firstUser')
      .leftJoin('secondPlayer.user', 'secondUser')
      .addSelect((subQuery) => {
        return subQuery
          .select(`jsonb_agg(json_build_object('answer', answer, 'addedAt', "addedAt"))`, 'answers')
          .from('answer', 'answer')
          .where('answer.playerId = secondPlayer.id')
          // .orderBy('answer.addedAt', 'ASC');
      }, 'secondPlayer_answers')
      .addSelect((subQuery) => {
        return subQuery
          .select(`jsonb_agg(json_build_object('answer', answer, 'addedAt', "addedAt"))`, 'answers')
          .from('answer', 'answer')
          .where('answer.playerId = firstPlayer.id')
          // .orderBy('answer.addedAt', 'ASC');
      }, 'firstPlayer_answers')
      .addSelect('firstPlayer.score', 'firstPlayer_score')
      .addSelect('firstPlayer.id', 'firstPlayer_id')
      .addSelect('firstUser.login', 'firstPlayer_login')
      .addSelect('firstUser.id', 'firstPlayer_userId')
      .addSelect('secondPlayer.score', 'secondPlayer_score')
      .addSelect('secondPlayer.id', 'secondPlayer_id')
      .addSelect('secondUser.login', 'secondPlayer_login')
      .addSelect('secondUser.id', 'secondPlayer_userId')
      ;
    const games = await gameQueryBuilder.where('game.gameStatus = :status', { status: GameStatus.Active }).getRawMany();
    return games;
  }
}
