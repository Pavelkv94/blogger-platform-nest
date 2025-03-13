import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../infrastructure/game.repository';
import { PlayerRepository } from '../../infrastructure/player.repository';
import { SelectQuestionsForGamePairCommand } from './select-questions-for-game.usecase';

export class ConnectToGamePairCommand {
  constructor(public readonly playerId: string) {}
}

@CommandHandler(ConnectToGamePairCommand)
export class ConnectToGamePairUseCase implements ICommandHandler<ConnectToGamePairCommand> {
  constructor(private readonly gameRepository: GameRepository, private readonly playerRepository: PlayerRepository, private readonly commandBus: CommandBus) {}

  async execute(command: ConnectToGamePairCommand): Promise<string> {
    const availableGamePair = await this.gameRepository.findAvailableGamePair();

    let gameId: string;

    if (!availableGamePair) {
      gameId = await this.gameRepository.createGamePair(command.playerId);
    } else {
      gameId = await this.gameRepository.connectToGamePair(command.playerId, availableGamePair);
      await this.commandBus.execute(new SelectQuestionsForGamePairCommand(gameId));
      await this.gameRepository.startGame(availableGamePair);
    }

    // await this.playerRepository.setGameIdForPlayer(command.playerId, gameId);
    return gameId;
  }
}
