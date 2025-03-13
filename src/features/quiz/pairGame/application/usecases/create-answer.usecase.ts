import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AnswerRepository } from '../../infrastructure/answer.repository';

export class CreateAnswerCommand {
  constructor(public readonly userId: string, public readonly answer: string) {}
}

@CommandHandler(CreateAnswerCommand)
export class CreateAnswerUseCase implements ICommandHandler<CreateAnswerCommand> {
  constructor(private readonly answerRepository: AnswerRepository) {}

  async execute(command: CreateAnswerCommand): Promise<string> {
    const newAnswer = await this.answerRepository.createAnswer(command.answer);

    return newAnswer.id.toString();
  }
}
