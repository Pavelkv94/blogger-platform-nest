import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../infrastructure/game.repository';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { PlayerRepository } from '../../infrastructure/player.repository';
import { PlayerStatus } from '../../dto/player-status';

export class FinishGameCommand {
  constructor(public readonly gameId: string, public readonly playerId: string, public readonly secondPlayerId: string) {}
}

@CommandHandler(FinishGameCommand)
export class FinishGameUseCase implements ICommandHandler<FinishGameCommand> {
  constructor(private readonly gameRepository: GameRepository, private readonly playerRepository: PlayerRepository) {}

  async execute(command: FinishGameCommand): Promise<void> {
    const game = await this.gameRepository.findGameById(command.gameId);

    if(!game) {
      throw NotFoundDomainException.create('Game not found');
    }

    await this.playerRepository.updatePlayerScore(command.secondPlayerId);

    const currentPlayer = await this.playerRepository.findPlayerById(command.playerId);
    const secondPlayer = await this.playerRepository.findPlayerById(command.secondPlayerId);

    if(currentPlayer.score > secondPlayer.score) {
      await this.playerRepository.updatePlayerStatus(command.secondPlayerId, PlayerStatus.WIN);
      await this.playerRepository.updatePlayerStatus(command.playerId, PlayerStatus.LOSE);
    } else if(currentPlayer.score < secondPlayer.score) {
      await this.playerRepository.updatePlayerStatus(command.secondPlayerId, PlayerStatus.LOSE);
      await this.playerRepository.updatePlayerStatus(command.playerId, PlayerStatus.WIN);
    } else {
      await this.playerRepository.updatePlayerStatus(command.secondPlayerId, PlayerStatus.DRAW);
      await this.playerRepository.updatePlayerStatus(command.playerId, PlayerStatus.DRAW);
    }

    await this.gameRepository.finishGame(game);
  }
}
