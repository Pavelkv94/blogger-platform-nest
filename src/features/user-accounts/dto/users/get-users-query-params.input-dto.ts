//dto для запроса списка юзеров с пагинацией, сортировкой, фильтрами

import { BaseSortablePaginationParams } from '../../../../core/dto/base.query-params.input-dto';
import { UsersSortBy } from './users-sort-by';
import { IsOptional, IsString } from 'class-validator';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class GetUsersQueryParams extends BaseSortablePaginationParams<UsersSortBy> {
  @ApiProperty({ example: 'createdAt', description: 'Sort by createdAt', enum: UsersSortBy, required: false })
  @IsEnum(UsersSortBy)
  sortBy = UsersSortBy.CreatedAt;

  @ApiProperty({ example: 'test', description: 'Search by login', type: String, required: false })
  @IsString()
  @IsOptional()
  searchLoginTerm: string | null = null;

  @ApiProperty({ example: 'test@test.com', description: 'Search by email', type: String, required: false })
  @IsString()
  @IsOptional()
  searchEmailTerm: string | null = null;
}
