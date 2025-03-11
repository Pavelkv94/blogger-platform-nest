import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { QuestionUpdateDto } from '../../dto/question-update.dto';
import { NotFoundDomainException } from '../../../../../core/exeptions/domain-exceptions';

export class UpdateQuestionCommand {
  constructor(
    public readonly id: string,
    public readonly payload: QuestionUpdateDto,
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase implements ICommandHandler<UpdateQuestionCommand> {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: UpdateQuestionCommand): Promise<void> {
    const question = await this.questionsRepository.findQuestionById(command.id);
    if (!question) {
      throw NotFoundDomainException.create('Question not found');
    }

    await this.questionsRepository.updateQuestion(question, command.payload);
  }
}
