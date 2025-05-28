import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameQuestions } from '../domain/game-questions.entity';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';

@Injectable()
export class GameQuestionsQueryRepository {
  constructor(@InjectRepository(GameQuestions) private gameQuestionsRepositoryTypeOrm: Repository<GameQuestions>) {}

  async findGameQuestionsByGameId(gameId: string): Promise<GameQuestions[]> {
    const gameQuestions = await this.gameQuestionsRepositoryTypeOrm.find({ where: { gameId: gameId } });
    if (!gameQuestions) {
      throw NotFoundDomainException.create('Game questions not found');
    }
    return gameQuestions;
  }
}
