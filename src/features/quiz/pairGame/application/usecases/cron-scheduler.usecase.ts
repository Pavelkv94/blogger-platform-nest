// import { Cron } from '@nestjs/schedule';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../infrastructure/game.repository';
import { PlayerRepository } from '../../infrastructure/player.repository';
// import { PlayerStatus } from '../../dto/player-status';
import { AnswerRepository } from '../../infrastructure/answer.repository';
import { PlayerStatus } from '../../dto/player-status';
import { Cron, CronExpression } from '@nestjs/schedule';

const TIME_DIFFERENCE = 3000;
export class CronSchedulerCommand {
  constructor() { }
}

@CommandHandler(CronSchedulerCommand)
export class CronSchedulerUseCase implements ICommandHandler<CronSchedulerCommand> {
  constructor(private readonly gameRepository: GameRepository, private readonly playerRepository: PlayerRepository, private readonly answerRepository: AnswerRepository) { }

  async execute(): Promise<void> {
  }

  // @Cron(CronExpression.EVERY_SECOND)
  @Cron(CronExpression.EVERY_10_HOURS)

  async handleCron() {
    // console.log('Cron job executed at every 10 seconds');
    const games = await this.gameRepository.findAllGames();

    for (const game of games) {

      // console.log(game.firstPlayer_answers);
      // console.log(game.secondPlayer_answers);
      const firstPlayerAnswersLength = game.firstPlayer_answers.length || 0;
      const secondPlayerAnswersLength = game.secondPlayer_answers.length || 0;

      if (firstPlayerAnswersLength === 5 && secondPlayerAnswersLength < 5) {
        const givenTimestamp = new Date(game.firstPlayer_answers[4].addedAt);
        const currentTimestamp = new Date();
        const timeDifference = currentTimestamp.getTime() - givenTimestamp.getTime();

        if (timeDifference > TIME_DIFFERENCE) {
          await this.playerRepository.updatePlayerScore(game.firstPlayer_id);
          await this.playerRepository.updatePlayerStatus(game.firstPlayer_id, PlayerStatus.WIN);
          const incorrectAnswersForSecondPlayer = 5 - secondPlayerAnswersLength;

          for (let i = 0; i < incorrectAnswersForSecondPlayer; i++) {
            await this.answerRepository.createAnswer("Incorrect", game.secondPlayer_id, false, game.id);
          }
          await this.playerRepository.updatePlayerStatus(game.secondPlayer_id, PlayerStatus.LOSE);

          await this.gameRepository.finishGame(game.id);
          console.log('Game is finished');
        }
          
      }

      if (secondPlayerAnswersLength === 5 && firstPlayerAnswersLength < 5) {
        const givenTimestamp = new Date(game.secondPlayer_answers[4].addedAt);
        const currentTimestamp = new Date();
        const timeDifference = currentTimestamp.getTime() - givenTimestamp.getTime();

        if (timeDifference > TIME_DIFFERENCE) {
          await this.playerRepository.updatePlayerScore(game.secondPlayer_id);
          await this.playerRepository.updatePlayerStatus(game.secondPlayer_id, PlayerStatus.WIN);
          const incorrectAnswersForFirstPlayer = 5 - firstPlayerAnswersLength;

          for (let i = 0; i < incorrectAnswersForFirstPlayer; i++) {
            await this.answerRepository.createAnswer("Incorrect", game.firstPlayer_id, false, game.id);
          }
          await this.playerRepository.updatePlayerStatus(game.firstPlayer_id, PlayerStatus.LOSE);

          await this.gameRepository.finishGame(game.id);
          console.log('Game is finished');
        }
          
      }
    }

  }


}
