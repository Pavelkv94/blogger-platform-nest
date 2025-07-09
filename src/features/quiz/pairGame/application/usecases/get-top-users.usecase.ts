import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PlayerRepository } from "../../infrastructure/player.repository";

export class GetTopUsersCommand {
    constructor() { }
}

@CommandHandler(GetTopUsersCommand)
export class GetTopUsersUseCase implements ICommandHandler<GetTopUsersCommand> {
    constructor(private readonly playerRepository: PlayerRepository) { }

    async execute(command: GetTopUsersCommand): Promise<any> {
        // const players = await this.playerRepository.findAll();
        console.log(command);
        return [];
    }
}