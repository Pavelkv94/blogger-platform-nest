import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AnswerRepository } from '../../infrastructure/answer.repository';
import { PlayerRepository } from '../../infrastructure/player.repository';

export class CreateAnswerCommand {
  constructor(
    public readonly userId: string,
    public readonly answer: string,
    public readonly playerId: number,
    public readonly answerIsCorrect: boolean,
    public readonly questionId: number
  ) { }
}

@CommandHandler(CreateAnswerCommand)
export class CreateAnswerUseCase implements ICommandHandler<CreateAnswerCommand> {
  constructor(private readonly answerRepository: AnswerRepository, private readonly playerRepository: PlayerRepository) { }

  async execute(command: CreateAnswerCommand): Promise<string> {
    const newAnswer = await this.answerRepository.createAnswer(command.answer, command.playerId, command.answerIsCorrect, command.questionId);

    if (command.answerIsCorrect) {
      await this.playerRepository.updatePlayerScore(command.playerId.toString());
    }

    return newAnswer.id.toString();
  }
}
