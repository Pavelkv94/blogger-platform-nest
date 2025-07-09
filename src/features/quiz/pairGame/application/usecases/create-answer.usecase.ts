import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AnswerRepository } from '../../infrastructure/answer.repository';
import { PlayerRepository } from '../../infrastructure/player.repository';
import { Player } from '../../domain/player.entity';
import { PlayerStatus } from '../../dto/player-status';
import { GameRepository } from '../../infrastructure/game.repository';
import { GameViewDto } from '../../dto/game-view.dto';
import { AnswerQueryRepository } from '../../infrastructure/answer.query-repository';

export class CreateAnswerCommand {
  constructor(
    public readonly userId: string,
    public readonly answer: string,
    public readonly playerId: number,
    public readonly answerIsCorrect: boolean,
    public readonly questionId: string,
    public readonly player: Player,
    public readonly secondPlayer: Player,
    public readonly game: GameViewDto,

  ) { }
}

@CommandHandler(CreateAnswerCommand)
export class CreateAnswerUseCase implements ICommandHandler<CreateAnswerCommand> {
  constructor(
    private readonly answerRepository: AnswerRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly gameRepository: GameRepository,
    private readonly answerQueryRepository: AnswerQueryRepository
  ) { }

  async execute(command: CreateAnswerCommand): Promise<string> {
    const newAnswer = await this.answerRepository.createAnswer(command.answer, command.playerId, command.answerIsCorrect, command.questionId);

    if (command.answerIsCorrect) {
      await this.playerRepository.updatePlayerScore(command.playerId.toString());
    }
    const game = await this.gameRepository.findGameById(command.game.id);


    setTimeout(async () => {
      const currentPlayerAnswers = await this.answerQueryRepository.findAnswersByPlayerId(command.playerId);
      const secondPlayerAnswers = await this.answerQueryRepository.findAnswersByPlayerId(command.secondPlayer.id);

      if (currentPlayerAnswers.length === 5 && secondPlayerAnswers.length < 5) {
        await this.playerRepository.updatePlayerStatus(command.playerId.toString(), PlayerStatus.WIN);

        const incorrectAnswersForSecondPlayer = 5 - secondPlayerAnswers.length;

        for (let i = 0; i < incorrectAnswersForSecondPlayer; i++) {
          await this.answerRepository.createAnswer("Incorrect", +command.secondPlayer.id, false, command.game.id.toString());
        }
        await this.playerRepository.updatePlayerStatus(command.secondPlayer.id.toString(), PlayerStatus.LOSE);
        await this.playerRepository.updatePlayerScore(command.playerId.toString());
        await this.gameRepository.finishGame(game!);

      }
      //     const secondPlayerId = [game.secondPlayerId, game.firstPlayerId].find(id => id !== command.playerId.toString()) || "";
      //     const secondPlayer = await this.playerRepository.findPlayerById(secondPlayerId.toString());
      //     if (secondPlayer.answers.length < 5) {

      //       await this.playerRepository.updatePlayerStatus(command.playerId.toString(), PlayerStatus.WIN);
      //       const incorrectAnswersForSecondPlayer = 5 - secondPlayer.answers.length;

      //       for (let i = 0; i < incorrectAnswersForSecondPlayer; i++) {
      //         await this.answerRepository.createAnswer("Incorrect", +secondPlayerId, false, game.id.toString());
      //       }
      //       await this.playerRepository.updatePlayerStatus(secondPlayerId, PlayerStatus.LOSE);

      //       await this.gameRepository.finishGame(game);

      //     }

    }, 3000);

    return newAnswer.id.toString();
  }
}
