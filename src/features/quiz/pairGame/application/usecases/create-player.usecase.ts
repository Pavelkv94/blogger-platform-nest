import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PlayerRepository } from '../../infrastructure/player.repository';

export class CreatePlayerCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(CreatePlayerCommand)
export class CreatePlayerUseCase implements ICommandHandler<CreatePlayerCommand> {
  constructor(private readonly playerRepository: PlayerRepository) {}

  async execute(command: CreatePlayerCommand): Promise<string> {
    const newPlayer = await this.playerRepository.createPlayer(command.userId);

    return newPlayer.id.toString();
  }
}
