import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { NotFoundDomainException } from '../../../../../core/exeptions/domain-exceptions';

export class DeleteQuestionCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase implements ICommandHandler<DeleteQuestionCommand> {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: DeleteQuestionCommand): Promise<void> {
    const question = await this.questionsRepository.findQuestionById(command.id);

    if (!question) {
      throw NotFoundDomainException.create('Question not found');
    }

    await this.questionsRepository.deleteQuestion(question);
  }
}
