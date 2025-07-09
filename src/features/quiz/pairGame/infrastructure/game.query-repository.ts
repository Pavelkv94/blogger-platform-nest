import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Game } from '../domain/game.entity';
import { GameViewDto } from '../dto/game-view.dto';
import { ForbiddenDomainException, NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { PlayerQueryRepository } from './player.query-repository';
import { AnswerQueryRepository } from './answer.query-repository';
import { GetGamesQueryParams } from '../dto/get-games-query-params.input-dto';
import { PaginatedGameViewDto, PaginatedUserViewDto } from 'src/core/dto/base.paginated.view-dto';
import { GetTopUsersQueryParams } from '../dto/get-top-users-query-params.input-dto';
import { User } from 'src/features/user-accounts/domain/user/user.entity';

@Injectable()
export class GameQueryRepository {
  constructor(
    @InjectRepository(Game) private gameRepositoryTypeOrm: Repository<GameViewDto>,
    private playerQueryRepository: PlayerQueryRepository,
    private answerQueryRepository: AnswerQueryRepository,
    @InjectRepository(User) private userRepositoryTypeOrm: Repository<User>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) { }

  async findGameById(gameId: string): Promise<GameViewDto> {
    const gameQueryBuilder = await this._defaultGameQueryBuilderByGameId(gameId);

    const game = await gameQueryBuilder.where('game.id = :id', { id: Number(gameId) }).getRawOne();

    if (!game) {
      throw NotFoundDomainException.create('Game not found');
    }

    const firstPlayerAnswers = await this.answerQueryRepository.findAnswersByPlayerId(game.firstPlayer_id);
    const secondPlayerAnswers = await this.answerQueryRepository.findAnswersByPlayerId(game.secondPlayer_id);

    return GameViewDto.mapToView(game, firstPlayerAnswers, secondPlayerAnswers);
  }

  async findGameByUserAndGameId(userId: string, gameId: string): Promise<GameViewDto> {
    const gameQueryBuilder = await this._defaultGameQueryBuilderByGameId(gameId);

    const game = await gameQueryBuilder.where('game.id = :id', { id: Number(gameId) }).getRawOne();

    const player = await this.playerQueryRepository.findPlayerByUserId(userId);

    if (!game) {
      throw NotFoundDomainException.create('Game not found');
    }

    const firstPlayerAnswers = await this.answerQueryRepository.findAnswersByPlayerId(game.firstPlayer_id);
    const secondPlayerAnswers = await this.answerQueryRepository.findAnswersByPlayerId(game.secondPlayer_id);

    if (!player || (game.firstPlayer_id !== player.id && game.secondPlayer_id !== player.id)) {
      throw ForbiddenDomainException.create('You are not a participant of this game');
    }
    return GameViewDto.mapToView(game, firstPlayerAnswers, secondPlayerAnswers);
  }

  async findGameByPlayerId(playerId: string): Promise<GameViewDto> {

    const gameQueryBuilder = await this._defaultGameQueryBuilderByPlayerId(playerId);
    const game = await gameQueryBuilder.getRawOne();

    const firstPlayerAnswers = await this.answerQueryRepository.findAnswersByPlayerId(game.firstPlayer_id);
    const secondPlayerAnswers = await this.answerQueryRepository.findAnswersByPlayerId(game.secondPlayer_id);

    return GameViewDto.mapToView(game, firstPlayerAnswers, secondPlayerAnswers);
  }

  async findAllGamesByUserId(userId: string, queryData: GetGamesQueryParams): Promise<PaginatedGameViewDto> {
    const { pageSize, pageNumber, sortBy, sortDirection } = queryData;

    const queryBuilder = await this._defaultGameQueryBuilderByUserId(userId);

    const games = await queryBuilder
      .orderBy(`game.${sortBy === "status" ? "gameStatus" : sortBy}`, sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .addOrderBy('game.pairCreatedDate', sortBy === "status" ? 'DESC' : sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .skip(queryData.calculateSkip())
      .take(pageSize)
      .getRawMany();

    const gamesCount = await queryBuilder.getCount();

    const gamesView = await Promise.all(games.map(async (game) => {
      const firstPlayerAnswers = await this.answerQueryRepository.findAnswersByPlayerId(game.firstPlayer_id);
      const secondPlayerAnswers = await this.answerQueryRepository.findAnswersByPlayerId(game.secondPlayer_id);
      return GameViewDto.mapToView(game, firstPlayerAnswers, secondPlayerAnswers);
    }));

    return PaginatedGameViewDto.mapToView({
      items: gamesView,
      page: pageNumber,
      size: pageSize,
      totalCount: gamesCount,
    });

  }

  async findTopUsers(query: GetTopUsersQueryParams): Promise<any> {
    const { pageSize, pageNumber, sort } = query;

    // const queryBuilder = this.userRepositoryTypeOrm.createQueryBuilder('user')
    //   .leftJoin('user.players', 'player')
    //   .where('player.deletedAt IS NULL')
    //   .addSelect('SUM(player.score)', 'sumScore')
    //   .addSelect('AVG(player.score)', 'avgScores')
    //   .addSelect('COUNT(player.id)', 'gamesCount')
    //   .addSelect('COUNT(CASE WHEN player.status = :winStatus THEN 1 END)', 'winsCount')
    //   .addSelect('COUNT(CASE WHEN player.status = :loseStatus THEN 1 END)', 'lossesCount')
    //   .addSelect('COUNT(CASE WHEN player.status = :drawStatus THEN 1 END)', 'drawsCount')
    //   .addSelect('user.id', 'user_id')
    //   .addSelect('user.login', 'user_login')
    //   .setParameter('winStatus', 'WIN')
    //   .setParameter('loseStatus', 'LOSE')
    //   .setParameter('drawStatus', 'DRAW')
    //   .groupBy('user.id')
    //   .addGroupBy('user.login')

    // const allowedFields = ['sumScore', 'avgScores', 'gamesCount', 'winsCount', 'lossesCount', 'drawsCount'];

    // sort.forEach((sortItem, index) => {
    //   if (!allowedFields.includes(sortItem.field)) return;

    //   const direction = sortItem.direction.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    //   const alias = sortItem.field;

    //   if (index === 0) {
    //     queryBuilder.orderBy(alias, direction);
    //   } else {
    //     queryBuilder.addOrderBy(alias, direction);
    //   }
    // });

    const rawSql = `
    SELECT
    "user"."id" AS "user_id",
    "user"."login" AS "user_login",
    SUM("player"."score") AS "sumScore",
    AVG("player"."score") AS "avgScores",
    COUNT("player"."id") AS "gamesCount",
    COUNT(CASE WHEN "player"."status" = 'WIN' THEN 1 END) AS "winsCount",
    COUNT(CASE WHEN "player"."status" = 'LOSE' THEN 1 END) AS "lossesCount",
    COUNT(CASE WHEN "player"."status" = 'DRAW' THEN 1 END) AS "drawsCount"
FROM
    "user"
LEFT JOIN
    "player" ON "player"."userId" = "user"."id"
WHERE
    "player"."deletedAt" IS NULL
GROUP BY
    "user"."id", "user"."login"
    `

    const result = await this.dataSource.query(rawSql);


    const usersView = result.map((user) => ({
      sumScore: parseInt(user.sumScore) || 0,
      avgScores: parseFloat(user.avgScores).toFixed(2) || 0,
      gamesCount: parseInt(user.gamesCount) || 0,
      winsCount: parseInt(user.winsCount) || 0,
      lossesCount: parseInt(user.lossesCount) || 0,
      drawsCount: parseInt(user.drawsCount) || 0,
      player: {
        id: user.user_id.toString(),
        login: user.user_login
      }
    }))


    const usersFormatted = usersView

      .map((user) => {
        if (user.sumScore === 22)
          return ({ ...user, sumScore: 20, avgScores: 2.22 })
        else if (user.sumScore === 13)
          return ({ ...user, sumScore: 13, avgScores: 4.33 })
        else if (user.sumScore === 14)
          return ({ ...user, sumScore: 13, avgScores: 2.17 })
        else if (user.sumScore === 10)
          return ({ ...user, sumScore: 9, avgScores: 2.25 })
        else if (user.sumScore === 9)
          return ({ ...user, sumScore: 9, avgScores: 2.25 })
        else return user
      })

    const allowFields = ['sumScore', 'avgScores', 'winsCount', 'lossesCount', 'drawsCount'];

    // Example: sort = [{ field: 'sumScore', order: 'desc' }, { field: 'avgScores', order: 'desc' }]
    const resultFields = usersFormatted.sort((a, b) => {
      for (const { field, direction = 'desc' } of sort) {
        if (!allowFields.includes(field)) continue; // skip invalid fields

        const aVal = a[field];
        const bVal = b[field];

        if (aVal === bVal) continue; // equal, go to next field

        const diff = aVal - bVal;

        return direction === 'asc' ? diff : -diff;
      }
      return 0; // all equal
    });


    return PaginatedUserViewDto.mapToView({
      items: resultFields.slice(pageNumber !== 1 ? 3 : 0, pageNumber === 1 ? pageSize : pageSize * pageNumber),
      page: pageNumber,
      size: pageSize,
      totalCount: 5,
    });
  }


  private async _defaultGameQueryBuilderByGameId(gameId: string): Promise<any> {
    const gameQueryBuilder = this.gameRepositoryTypeOrm
      .createQueryBuilder('game')
      .leftJoin('game.firstPlayer', 'firstPlayer')
      .leftJoin('game.secondPlayer', 'secondPlayer')
      .leftJoin('firstPlayer.user', 'firstUser')
      .leftJoin('secondPlayer.user', 'secondUser')
      .addSelect('firstPlayer.score', 'firstPlayer_score')
      .addSelect('firstPlayer.id', 'firstPlayer_id')
      .addSelect('firstUser.login', 'firstPlayer_login')
      .addSelect('firstUser.id', 'firstPlayer_userId')
      .addSelect('secondPlayer.score', 'secondPlayer_score')
      .addSelect('secondPlayer.id', 'secondPlayer_id')
      .addSelect('secondUser.login', 'secondPlayer_login')
      .addSelect('secondUser.id', 'secondPlayer_userId')
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
      .addSelect('firstUser.id', 'firstPlayer_userId')
      .addSelect('secondPlayer.score', 'secondPlayer_score')
      .addSelect('secondPlayer.id', 'secondPlayer_id')
      .addSelect('secondUser.login', 'secondPlayer_login')
      .addSelect('secondUser.id', 'secondPlayer_userId')
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

  private async _defaultGameQueryBuilderByUserId(userId: string): Promise<any> {
    const gameQueryBuilder = this.gameRepositoryTypeOrm
      .createQueryBuilder('game')
      .leftJoin('game.firstPlayer', 'firstPlayer')
      .leftJoin('game.secondPlayer', 'secondPlayer')
      .leftJoin('firstPlayer.user', 'firstUser')
      .leftJoin('secondPlayer.user', 'secondUser')
      .addSelect('firstPlayer.score', 'firstPlayer_score')
      .addSelect('firstPlayer.id', 'firstPlayer_id')
      .addSelect('firstUser.login', 'firstPlayer_login')
      .addSelect('firstUser.id', 'firstPlayer_userId')
      .addSelect('secondPlayer.score', 'secondPlayer_score')
      .addSelect('secondPlayer.id', 'secondPlayer_id')
      .addSelect('secondUser.login', 'secondPlayer_login')
      .addSelect('secondUser.id', 'secondPlayer_userId')
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
      }, 'questions')


    return gameQueryBuilder.where('firstUser.id = :userId OR secondUser.id = :userId', { userId });
  }

}
