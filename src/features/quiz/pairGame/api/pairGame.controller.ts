import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
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

@ApiTags('Pair Game') //swagger
@UseGuards(JwtAuthPassportGuard)
@Controller('pair-game-quiz/pairs')
export class PairGameController {
  constructor(
    private readonly gameQueryRepository: GameQueryRepository,
    private readonly playerQueryRepository: PlayerQueryRepository,
    private readonly answerQueryRepository: AnswerQueryRepository,
    private readonly gameQuestionsQueryRepository: GameQuestionsQueryRepository,
    private readonly questionsQueryRepository: QuestionsQueryRepository,
    private readonly commandBus: CommandBus,
  ) { }

  @Get('my-current')
  @HttpCode(HttpStatus.OK)
  async getMyCurrentGame(@ExtractAnyUserFromRequest() user: UserJwtPayloadDto): Promise<any> {
    const player = await this.playerQueryRepository.findPlayerByUserId(user.userId);

    if (!player) {
      throw NotFoundDomainException.create('Player not found');
    }

    //TODO: refactor this - findGameByUserId is not correct(return without questions)
    const game1 = await this.gameQueryRepository.findGameByUserId(user.userId);
    const game2 = await this.gameQueryRepository.findGameByUserAndGameId(user.userId, game1.id);
    if(game2.questions) {
      return {...game2, questions: game2.questions.map(q => ({...q, id: q.id.toString()}))};
    }
    return game2;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getGameById(@ExtractAnyUserFromRequest() user: UserJwtPayloadDto, @Param('id') id: string): Promise<any> {
    if (!id || isNaN(+id)) {
      throw BadRequestDomainException.create('Game id is required');
    }
    const game = await this.gameQueryRepository.findGameByUserAndGameId(user.userId, id);
    if(game.questions) {
      return {...game, questions: game.questions.map(q => ({...q, id: q.id.toString()}))};
    }
    return game;
  }

  @Post('connection')
  @HttpCode(HttpStatus.OK)
  async connection(@ExtractAnyUserFromRequest() user: UserJwtPayloadDto): Promise<any> {
    const userAlreadyInGame = await this.playerQueryRepository.findPlayerByUserId(user.userId);
    if (userAlreadyInGame) {
      throw ForbiddenDomainException.create('User is already in game');
    }

    const playerId = await this.commandBus.execute(new CreatePlayerCommand(user.userId));
    const gamePairId = await this.commandBus.execute(new ConnectToGamePairCommand(playerId));

    const gamePair = await this.gameQueryRepository.findGameById(gamePairId);

    return gamePair;
  }

  @Post('my-current/answers')
  @HttpCode(HttpStatus.OK)
  async answers(@ExtractAnyUserFromRequest() user: UserJwtPayloadDto, @Body() body: { answer: string }): Promise<any> {
    const player = await this.playerQueryRepository.findPlayerByUserId(user.userId);

    if (!player) {
      throw ForbiddenDomainException.create('Player not found');
    }

    const game = await this.gameQueryRepository.findGameByUserId(user.userId);

    if (game.status === GameStatus.PendingSecondPlayer) {
      throw ForbiddenDomainException.create('Game is not active');
    }

    if (game.status === GameStatus.Finished) {
      throw NotFoundDomainException.create('Game is finished');
    }

    const answers = await this.answerQueryRepository.findAnswersByPlayerId(player.id);

    if (answers.length >= 5) {
      throw ForbiddenDomainException.create('You have already answered 5 questions');
    }

    const secondPlayerId = [game.firstPlayerProgress.player.id, game.secondPlayerProgress.player.id].find(id => id !== player.id);
    const secondPlayerAnswers = await this.answerQueryRepository.findAnswersByPlayerId(secondPlayerId);


    const gameQuestion = await this.gameQuestionsQueryRepository.findGameQuestionByGameId(game.id);

    const question = await this.questionsQueryRepository.findQuestionByIdOrNotFoundFail(gameQuestion.questionId);

    const answerIsCorrect = question.correctAnswers.includes(body.answer);

    const answerId = await this.commandBus.execute(new CreateAnswerCommand(user.userId, body.answer, player.id, answerIsCorrect, Number(gameQuestion.questionId)));
    const answer = await this.answerQueryRepository.findAnswerById(answerId);

    if (secondPlayerAnswers.length === 5 && answers.length === 4) {
      await this.commandBus.execute(new FinishGameCommand(game.id));

    }
    return answer;
  }
}
