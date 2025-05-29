import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../infrastructure/game.repository';
import { PlayerRepository } from '../../infrastructure/player.repository';
import { PlayerStatus } from '../../dto/player-status';

type Statistic = {
    sumScore: number;
    avgScores: number;
    gamesCount: number;
    winsCount: number;
    lossesCount: number;
    drawsCount: number;
}
export class GetMyStatisticCommand {
    constructor(public readonly userId: string) { }
}

@CommandHandler(GetMyStatisticCommand)
export class GetMyStatisticUseCase implements ICommandHandler<GetMyStatisticCommand> {
    constructor(private readonly gameRepository: GameRepository, private readonly playerRepository: PlayerRepository) { }

    async execute(command: GetMyStatisticCommand): Promise<Statistic> {
        const players = await this.playerRepository.findPlayersByUserId(command.userId);

        const sumScore = players.reduce((acc, player) => acc + player.score, 0);
        const avgScores = Number((sumScore / players.length).toFixed(2));
        const gamesCount = players.length;
        const winsCount = players.filter(player => player.status === PlayerStatus.WIN).length;
        const lossesCount = players.filter(player => player.status === PlayerStatus.LOSE).length;
        const drawsCount = players.filter(player => player.status === PlayerStatus.DRAW).length;

        return {
            sumScore,
            avgScores,
            gamesCount,
            winsCount,
            lossesCount,
            drawsCount,
        };
    }
}
