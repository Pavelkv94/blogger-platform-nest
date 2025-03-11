import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { QuestionPublishDto } from '../../dto/question-update.dto';
import { NotFoundDomainException } from '../../../../../core/exeptions/domain-exceptions';

export class PublishQuestionCommand {
  constructor(
    public readonly id: string,
    public readonly payload: QuestionPublishDto,
  ) {}
}

@CommandHandler(PublishQuestionCommand)
export class PublishQuestionUseCase implements ICommandHandler<PublishQuestionCommand> {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: PublishQuestionCommand): Promise<void> {
    const question = await this.questionsRepository.findQuestionById(command.id);
    if (!question) {
      throw NotFoundDomainException.create('Question not found');
    }

    await this.questionsRepository.publishQuestion(question, command.payload);
  }
}
