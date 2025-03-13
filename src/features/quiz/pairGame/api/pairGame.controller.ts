import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { ExtractAnyUserFromRequest } from 'src/core/decorators/param/extract-user-from-request';
import { JwtAuthPassportGuard } from 'src/core/guards/passport/jwt-auth-passport.guard';
import { UserJwtPayloadDto } from 'src/features/user-accounts/dto/users/user-jwt-payload.dto';
import { GameQueryRepository } from '../infrastructure/game.query-repository';
import { ConnectToGamePairCommand } from '../application/usecases/connect-game.usecase';
import { ForbiddenDomainException } from 'src/core/exeptions/domain-exceptions';
import { PlayerQueryRepository } from '../infrastructure/player.query-repository';
import { CreatePlayerCommand } from '../application/usecases/create-player.usecase';
import { CreateAnswerCommand } from '../application/usecases/create-answer.usecase';
import { AnswerQueryRepository } from '../infrastructure/answer.query-repository';

@ApiTags('Pair Game') //swagger
@UseGuards(JwtAuthPassportGuard)
@Controller('pair-game-quiz/pairs')
export class PairGameController {
  constructor(
    private readonly gameQueryRepository: GameQueryRepository,
    private readonly playerQueryRepository: PlayerQueryRepository,
    private readonly answerQueryRepository: AnswerQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('my-current')
  @HttpCode(HttpStatus.OK)
  async getMyCurrentGame(@ExtractAnyUserFromRequest() user: UserJwtPayloadDto): Promise<any> {
    const game = await this.gameQueryRepository.findGameByUserId(user.userId);
    return game;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getGameById(@ExtractAnyUserFromRequest() user: UserJwtPayloadDto, @Param('id') id: string): Promise<any> {
    const game = await this.gameQueryRepository.findGameByUserAndGameId(user.userId, id);
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

  @Post('answers')
  @HttpCode(HttpStatus.OK)
  async answers(@ExtractAnyUserFromRequest() user: UserJwtPayloadDto, @Body() body: {answer: string}): Promise<any> {
   const answerId = await this.commandBus.execute(new CreateAnswerCommand(user.userId, body.answer));
   const answer = await this.answerQueryRepository.findAnswerById(answerId);
   return answer;
  }
}
