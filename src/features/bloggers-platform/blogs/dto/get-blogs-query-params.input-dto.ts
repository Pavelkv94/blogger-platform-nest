//dto для запроса списка юзеров с пагинацией, сортировкой, фильтрами

import { BaseSortablePaginationParams } from "src/core/dto/base.query-params.input-dto";
import { BlogsSortBy } from "./blogs-sort-by";
import { IsEnum } from "class-validator";
import { IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";


export class GetBlogsQueryParams extends BaseSortablePaginationParams<BlogsSortBy> {
  @ApiProperty({ example: 'createdAt', description: 'Sort by createdAt', enum: BlogsSortBy }) //swagger
  @IsEnum(BlogsSortBy)
  sortBy = BlogsSortBy.CreatedAt;

  @ApiProperty({ example: 'test', description: 'Search by name', type: String }) //swagger
  @IsString()
  @IsOptional()
  searchNameTerm: string | null = null;
}