import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../infrastructure/game.repository';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';

export class FinishGameCommand {
  constructor(public readonly gameId: string) {}
}

@CommandHandler(FinishGameCommand)
export class FinishGameUseCase implements ICommandHandler<FinishGameCommand> {
  constructor(private readonly gameRepository: GameRepository) {}

  async execute(command: FinishGameCommand): Promise<void> {
    const game = await this.gameRepository.findGameById(command.gameId);

    if(!game) {
      throw NotFoundDomainException.create('Game not found');
    }

    await this.gameRepository.finishGame(game);
  }
}
