import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { ExtractAnyUserFromRequest } from 'src/core/decorators/param/extract-user-from-request';
import { JwtAuthPassportGuard } from 'src/core/guards/passport/jwt-auth-passport.guard';
import { UserJwtPayloadDto } from 'src/features/user-accounts/dto/users/user-jwt-payload.dto';
import { GameQueryRepository } from '../infrastructure/game.query-repository';
import { ConnectToGamePairCommand } from '../application/usecases/connect-game.usecase';
import { BadRequestDomainException, ForbiddenDomainException, NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { PlayerQueryRepository } from '../infrastructure/player.query-repository';
import { CreatePlayerCommand } from '../application/usecases/create-player.usecase';
import { CreateAnswerCommand } from '../application/usecases/create-answer.usecase';
import { AnswerQueryRepository } from '../infrastructure/answer.query-repository';
import { GameQuestionsQueryRepository } from '../infrastructure/game-questions.query-repository';
import { QuestionsQueryRepository } from '../../questions/infrastructure/questions.query-repository';
import { GameStatus } from '../dto/game-status';
import { FinishGameCommand } from '../application/usecases/finish-game.usecase';
import { GetMyStatisticCommand } from '../application/usecases/get-my-stat.usecase';
import { PaginatedGameViewDto } from 'src/core/dto/base.paginated.view-dto';
import { GetGamesQueryParams } from '../dto/get-games-query-params.input-dto';

@ApiTags('Pair Game') //swagger
@UseGuards(JwtAuthPassportGuard)
@Controller('pair-game-quiz')
export class PairGameController {
  constructor(
    private readonly gameQueryRepository: GameQueryRepository,
    private readonly playerQueryRepository: PlayerQueryRepository,
    private readonly answerQueryRepository: AnswerQueryRepository,
    private readonly gameQuestionsQueryRepository: GameQuestionsQueryRepository,
    private readonly questionsQueryRepository: QuestionsQueryRepository,
    private readonly commandBus: CommandBus,
  ) { }

  @Get('pairs/my-current')
  @HttpCode(HttpStatus.OK)
  async getMyCurrentGame(@ExtractAnyUserFromRequest() user: UserJwtPayloadDto): Promise<any> {
    const activePlayer = await this.playerQueryRepository.findActivePlayerByUserId(user.userId);

    if (!activePlayer) {
      throw NotFoundDomainException.create('Player not found');
    }

    const game = await this.gameQueryRepository.findGameByPlayerId(activePlayer.id.toString());
    
    if(game.status === GameStatus.Finished) {
      throw NotFoundDomainException.create('Game is finished');
    }
    return game;
  }

  @Get('pairs/my')
  @HttpCode(HttpStatus.OK)
  async getAllMyGames(@ExtractAnyUserFromRequest() user: UserJwtPayloadDto, @Query() query: GetGamesQueryParams): Promise<PaginatedGameViewDto> {
    try {
      const games = await this.gameQueryRepository.findAllGamesByUserId(user.userId, query);
      return games;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Get('pairs/:id')
  @HttpCode(HttpStatus.OK)
  async getGameById(@ExtractAnyUserFromRequest() user: UserJwtPayloadDto, @Param('id') id: string): Promise<any> {

    if (!id || isNaN(+id)) {
      throw BadRequestDomainException.create('Game id is required');
    }
    const game = await this.gameQueryRepository.findGameById(id);
    const firstPlayerId = game.firstPlayerProgress.player.id;
    const secondPlayerId = game.secondPlayerProgress?.player.id;

    if(![firstPlayerId, secondPlayerId].includes(user.userId.toString())) {
      throw ForbiddenDomainException.create('You are not a participant of this game');
    }

    return game;
  }

  @Post('pairs/connection')
  @HttpCode(HttpStatus.OK)
  async connection(@ExtractAnyUserFromRequest() user: UserJwtPayloadDto): Promise<any> {

    const activePlayer = await this.playerQueryRepository.findActivePlayerByUserId(user.userId);

    if (activePlayer) {
      throw ForbiddenDomainException.create('User is already in game');
    }

    const playerId = await this.commandBus.execute(new CreatePlayerCommand(user.userId));
    const gamePairId = await this.commandBus.execute(new ConnectToGamePairCommand(playerId));

    const gamePair = await this.gameQueryRepository.findGameById(gamePairId);

    return gamePair;
  }

  @Post('pairs/my-current/answers')
  @HttpCode(HttpStatus.OK)
  async answers(@ExtractAnyUserFromRequest() user: UserJwtPayloadDto, @Body() body: { answer: string }): Promise<any> {
    const player = await this.playerQueryRepository.findActivePlayerByUserId(user.userId);

    if (!player) {
      throw ForbiddenDomainException.create('Player not found');
    }

    const game = await this.gameQueryRepository.findGameByPlayerId(player.id.toString());

    if (game.status === GameStatus.PendingSecondPlayer) {
      throw ForbiddenDomainException.create('Game is not active');
    }

    if (game.status === GameStatus.Finished) {
      throw NotFoundDomainException.create('Game is finished');
    }

    const currentPlayerAnswers = await this.answerQueryRepository.findAnswersByPlayerId(player.id);

    if (currentPlayerAnswers.length >= 5) {
      throw ForbiddenDomainException.create('You have already answered 5 questions');
    }
    const secondPlayerUserId = [game.firstPlayerProgress.player.id, game.secondPlayerProgress.player.id].find(id => id != user.userId);

    const secondPlayer = await this.playerQueryRepository.findActivePlayerByUserId(secondPlayerUserId);

    const secondPlayerAnswers = await this.answerQueryRepository.findAnswersByPlayerId(secondPlayer!.id);

    const gameQuestions = await this.gameQuestionsQueryRepository.findGameQuestionsByGameId(game.id);
    const questionId = gameQuestions[currentPlayerAnswers.length].questionId;
    const question = await this.questionsQueryRepository.findQuestionByIdOrNotFoundFail(questionId);

    const answerIsCorrect = question.correctAnswers.includes(body.answer);

    const answerId = await this.commandBus.execute(new CreateAnswerCommand(user.userId, body.answer, player.id, answerIsCorrect, questionId));
    
    const answer = await this.answerQueryRepository.findAnswerById(answerId);
    if (secondPlayerAnswers.length === 5 && currentPlayerAnswers.length === 4) {
      await this.commandBus.execute(new FinishGameCommand(game.id,  player.id.toString(), secondPlayer!.id.toString()));
    }
    return answer;
  }

  @Get('users/my-statistic')
  @HttpCode(HttpStatus.OK)
  async getMyStatistic(@ExtractAnyUserFromRequest() user: UserJwtPayloadDto): Promise<any> {
    const statistic = await this.commandBus.execute(new GetMyStatisticCommand(user.userId));
    return statistic;
  }



}
