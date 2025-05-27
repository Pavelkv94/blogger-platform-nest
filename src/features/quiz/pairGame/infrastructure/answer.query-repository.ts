import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from '../domain/answer.entity';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { AnswerViewDto } from '../dto/answer-view.dto';

@Injectable()
export class AnswerQueryRepository {
  constructor(@InjectRepository(Answer) private answerRepositoryTypeOrm: Repository<AnswerViewDto>) {}

  async findAnswersByPlayerId(playerId: number): Promise<any[]> {
    const answers = await this.answerRepositoryTypeOrm.createQueryBuilder('answer')
      .where('answer.playerId = :playerId', { playerId: playerId })
      .getMany();
    return answers;
  }


  async findAnswerById(answerId: string): Promise<AnswerViewDto> {
    const answer = await this.answerRepositoryTypeOrm.createQueryBuilder('answer')
      .where('answer.id = :id', { id: answerId })
      .getRawOne();

    if (!answer) {
      throw NotFoundDomainException.create('Answer not found');
    }
    return AnswerViewDto.mapToView(answer);
  }
}
