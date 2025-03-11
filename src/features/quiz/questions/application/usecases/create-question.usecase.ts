import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionCreateDto } from '../../dto/question-create.dto';
import { QuestionsRepository } from '../../infrastructure/questions.repository';

export class CreateQuestionCommand {
  constructor(public readonly payload: QuestionCreateDto) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase implements ICommandHandler<CreateQuestionCommand> {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: CreateQuestionCommand): Promise<string> {
    const newQuestionId = await this.questionsRepository.createQuestion(command.payload);

    return newQuestionId;
  }
}
