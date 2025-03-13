import { Injectable } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../domain/player.entity';

@Injectable()
export class PlayerQueryRepository {
  constructor(@InjectRepository(Player) private playerRepositoryTypeOrm: Repository<Player>) {}

  async findPlayerByUserId(userId: string): Promise<Player | null> {
    const player = await this.playerRepositoryTypeOrm.findOne({ where: { userId: userId, deletedAt: IsNull() } });
    return player;
  }

  // async findQuestions(queryData: GetQuestionsQueryParams): Promise<PaginatedQuestionViewDto> {
  //   const { pageSize, pageNumber, sortBy, sortDirection, bodySearchTerm, publishedStatus } = queryData;

  //   const queryBuilder = this.questionRepositoryTypeOrm.createQueryBuilder('question').where('question.deletedAt IS NULL');

  //   if (bodySearchTerm) {
  //     queryBuilder.andWhere('question.body ILIKE :bodySearchTerm', { bodySearchTerm: `%${bodySearchTerm}%` });
  //   }
  //   if (publishedStatus === PublishedStatus.Published) {
  //     queryBuilder.andWhere('question.published = :published', { published: true });
  //   }
  //   if (publishedStatus === PublishedStatus.NotPublished) {
  //     queryBuilder.andWhere('question.published = :published', { published: false });
  //   }

  //   const questions = await queryBuilder
  //     .orderBy(`question.${sortBy}`, sortDirection.toUpperCase() as 'ASC' | 'DESC')
  //     .skip(queryData.calculateSkip())
  //     .take(pageSize)
  //     .getMany();

  //   const questionsCount = await queryBuilder.getCount();

  //   const questionsView = questions.map((question) => QuestionViewDto.mapToView(question));

  //   return PaginatedQuestionViewDto.mapToView({
  //     items: questionsView,
  //     page: pageNumber,
  //     size: pageSize,
  //     totalCount: questionsCount,
  //   });
  // }

  // async findQuestionByIdOrNotFoundFail(questionId: string): Promise<QuestionViewDto> {
  //   const question = await this.questionRepositoryTypeOrm
  //     .createQueryBuilder('question')
  //     .where('question.id = :id', { id: Number(questionId) })
  //     .andWhere('question.deletedAt IS NULL')
  //     .getOne();

  //   if (!question) {
  //     throw NotFoundDomainException.create('Question not found');
  //   }

  //   return QuestionViewDto.mapToView(question);
  // }
}
