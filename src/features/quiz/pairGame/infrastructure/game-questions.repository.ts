import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameQuestions } from '../domain/game-questions.entity';

@Injectable()
export class GameQuestionsRepository {
  constructor(@InjectRepository(GameQuestions) private gameQuestionsRepositoryTypeOrm: Repository<GameQuestions>) {}

  async createGameQuestion(gameQuestions: Array<GameQuestions>): Promise<void> {
    await this.gameQuestionsRepositoryTypeOrm.save(gameQuestions);
  }
}
