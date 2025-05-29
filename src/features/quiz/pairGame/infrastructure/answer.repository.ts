import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from '../domain/answer.entity';

@Injectable()
export class AnswerRepository {
  constructor(@InjectRepository(Answer) private answerRepositoryTypeOrm: Repository<Answer>) {}

  async createAnswer(answer: string, playerId: number, answerIsCorrect: boolean, questionId: string): Promise<Answer> {
    const newAnswer = Answer.buildInstance(answer, questionId, playerId, answerIsCorrect);
    await this.answerRepositoryTypeOrm.save(newAnswer);
    return newAnswer;
  }
}
