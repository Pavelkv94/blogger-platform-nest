import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '../domain/game.entity';
import { GameViewDto } from '../dto/game-view.dto';
import { ForbiddenDomainException, NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { GameStatus } from '../dto/game-status';
import { PlayerQueryRepository } from './player.query-repository';
import { AnswerQueryRepository } from './answer.query-repository';

@Injectable()
export class GameQueryRepository {
  constructor(
    @InjectRepository(Game) private gameRepositoryTypeOrm: Repository<GameViewDto>,
    private playerQueryRepository: PlayerQueryRepository,
    private answerQueryRepository: AnswerQueryRepository
  ) { }

  async findGameById(gameId: string): Promise<GameViewDto> {
    const gameQueryBuilder = await this._defaultGameQueryBuilder(gameId);

    const game = await gameQueryBuilder.where('game.id = :id', { id: Number(gameId) }).getRawOne();

    if (!game) {
      throw NotFoundDomainException.create('Game not found');
    }

    return GameViewDto.mapToView(game, [], []);
  }

  async findGameByUserAndGameId(userId: string, gameId: string): Promise<GameViewDto> {
    const gameQueryBuilder = await this._defaultGameQueryBuilder(gameId);

    const game = await gameQueryBuilder.where('game.id = :id', { id: Number(gameId) }).getRawOne();

    const player = await this.playerQueryRepository.findPlayerByUserId(userId);

    if (!game) {
      throw NotFoundDomainException.create('Game not found');
    }

    const firstPlayerAnswers = await this.answerQueryRepository.findAnswersByPlayerId(game.firstPlayer_id);
    const secondPlayerAnswers = await this.answerQueryRepository.findAnswersByPlayerId(game.secondPlayer_id);

    if (!player || (game.firstPlayer_id !== player.id && game.secondPlayer_id !== player.id)) {
      console.log("You are not a participant of this game");
      throw ForbiddenDomainException.create('You are not a participant of this game');
    }
    return GameViewDto.mapToView(game, firstPlayerAnswers, secondPlayerAnswers);
  }

  async findGameByUserId(userId: string): Promise<GameViewDto> {
    const gameQueryBuilder = await this._defaultGameQueryBuilder('1');
    const game = await gameQueryBuilder
      .where(
        `(
          (firstUser.id = :userId AND game."gameStatus" = :pendingStatus) OR
          (firstUser.id = :userId OR secondUser.id = :userId) AND game."gameStatus" = :activeStatus
      )`,
        {
          userId: Number(userId),
          pendingStatus: GameStatus.PendingSecondPlayer,
          activeStatus: GameStatus.Active,
        },
      )
      .getRawOne();
    if (!game) {
      throw NotFoundDomainException.create('Game not found');
    }

    return GameViewDto.mapToView(game, [], []);
  }

  async findGameByPlayerId(playerId: string): Promise<GameViewDto> {

    const gameQueryBuilder = await this._defaultGameQueryBuilderByPlayerId(playerId);
    const game = await gameQueryBuilder.getRawOne();

    const firstPlayerAnswers = await this.answerQueryRepository.findAnswersByPlayerId(game.firstPlayer_id);
    const secondPlayerAnswers = await this.answerQueryRepository.findAnswersByPlayerId(game.secondPlayer_id);

    return GameViewDto.mapToView(game, firstPlayerAnswers, secondPlayerAnswers);
  }

  private async _defaultGameQueryBuilder(gameId: string): Promise<any> {
    const gameQueryBuilder = this.gameRepositoryTypeOrm
      .createQueryBuilder('game')
      .leftJoin('game.firstPlayer', 'firstPlayer')
      .leftJoin('game.secondPlayer', 'secondPlayer')
      .leftJoin('firstPlayer.user', 'firstUser')
      .leftJoin('secondPlayer.user', 'secondUser')
      .addSelect('firstPlayer.score', 'firstPlayer_score')
      .addSelect('firstPlayer.id', 'firstPlayer_id')
      .addSelect('firstUser.login', 'firstPlayer_login')
      .addSelect('secondPlayer.score', 'secondPlayer_score')
      .addSelect('secondPlayer.id', 'secondPlayer_id')
      .addSelect('secondUser.login', 'secondPlayer_login')
      .addSelect((qb) => {
        return qb.select(`jsonb_agg(json_build_object('id', qid, 'body', qbody))`).from((qb) => {
          return qb
            .select(`q.id`, 'qid')
            .addSelect('q.body', 'qbody')
            .from('question', 'q')
            .where('gq."gameId" = :gameId', { gameId: Number(gameId) })
            .leftJoin('game_questions', 'gq', 'q.id = gq."questionId"')
            .orderBy('gq.index', 'ASC');
        }, 'question');
      }, 'questions');

    return gameQueryBuilder;
  }

  private async _defaultGameQueryBuilderByPlayerId(playerId: string): Promise<any> {
    const gameQueryBuilder = this.gameRepositoryTypeOrm
      .createQueryBuilder('game')
      .leftJoin('game.firstPlayer', 'firstPlayer')
      .leftJoin('game.secondPlayer', 'secondPlayer')
      .leftJoin('firstPlayer.user', 'firstUser')
      .leftJoin('secondPlayer.user', 'secondUser')
      .where('firstPlayer.id = :playerId OR secondPlayer.id = :playerId', { playerId: Number(playerId) })
      .addSelect('firstPlayer.score', 'firstPlayer_score')
      .addSelect('firstPlayer.id', 'firstPlayer_id')
      .addSelect('firstUser.login', 'firstPlayer_login')
      .addSelect('secondPlayer.score', 'secondPlayer_score')
      .addSelect('secondPlayer.id', 'secondPlayer_id')
      .addSelect('secondUser.login', 'secondPlayer_login')
      .addSelect((qb) => {
        return qb.select(`jsonb_agg(json_build_object('id', qid, 'body', qbody))`).from((qb) => {
          return qb
            .select(`q.id`, 'qid')
            .addSelect('q.body', 'qbody')
            .from('question', 'q')
            .where('gq."gameId" = game.id')
            .leftJoin('game_questions', 'gq', 'q.id = gq."questionId"')
            .orderBy('gq.index', 'ASC');
        }, 'question');
      }, 'questions');

    return gameQueryBuilder;
  }
}
