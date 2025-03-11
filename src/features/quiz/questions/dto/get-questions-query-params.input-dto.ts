//dto для запроса списка юзеров с пагинацией, сортировкой, фильтрами

import { BaseSortablePaginationParams } from '../../../../core/dto/base.query-params.input-dto';
import { QuestionsSortBy } from './questions-sort-by';
import { IsEnum } from 'class-validator';
import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { PublishedStatus } from './questions-publishedStatus';

export class GetQuestionsQueryParams extends BaseSortablePaginationParams<QuestionsSortBy> {
  @ApiProperty({ example: 'createdAt', description: 'Sort by createdAt', enum: QuestionsSortBy }) //swagger
  @IsEnum(QuestionsSortBy)
  sortBy = QuestionsSortBy.CreatedAt;

  @ApiProperty({ example: 'test', description: 'Search by body', type: String }) //swagger
  @IsString()
  @IsOptional()
  bodySearchTerm: string | null = null;

  @ApiProperty({ example: 'all', description: 'Published status', type: String, enum: PublishedStatus }) //swagger
  @IsEnum(PublishedStatus)
  @IsOptional()
  publishedStatus: PublishedStatus = PublishedStatus.All;
}
