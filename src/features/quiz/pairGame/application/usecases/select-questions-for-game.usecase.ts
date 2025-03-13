import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from 'src/features/quiz/questions/infrastructure/questions.repository';
import { GameQuestionsRepository } from '../../infrastructure/game-questions.repository';
import { GameQuestions } from '../../domain/game-questions.entity';

export class SelectQuestionsForGamePairCommand {
  constructor(public readonly gameId: string) {}
}

@CommandHandler(SelectQuestionsForGamePairCommand)
export class SelectQuestionsForGamePairUseCase implements ICommandHandler<SelectQuestionsForGamePairCommand> {
  constructor(
    private readonly questionsRepository: QuestionsRepository,
    private readonly gameQuestionsRepository: GameQuestionsRepository,
  ) {}

  async execute(command: SelectQuestionsForGamePairCommand): Promise<void> {
    const questions = await this.questionsRepository.getRandomQuestions();

    if (questions.length !== 5) {
      throw new Error('Not enough questions');
    }

    const gameQuestions = questions.map((q, index) => {
      return GameQuestions.buildInstance(command.gameId, q.id.toString(), index);
    });

    return this.gameQuestionsRepository.createGameQuestion(gameQuestions);
  }
}
