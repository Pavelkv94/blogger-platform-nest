import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameQuestions } from '../domain/game-questions.entity';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';

@Injectable()
export class GameQuestionsQueryRepository {
  constructor(@InjectRepository(GameQuestions) private gameQuestionsRepositoryTypeOrm: Repository<GameQuestions>) {}

  async findGameQuestionByGameId(gameId: string): Promise<GameQuestions> {
    const gameQuestion = await this.gameQuestionsRepositoryTypeOrm.findOne({ where: { gameId: gameId } });
    if (!gameQuestion) {
      throw NotFoundDomainException.create('Game question not found');
    }
    return gameQuestion;
  }
}
