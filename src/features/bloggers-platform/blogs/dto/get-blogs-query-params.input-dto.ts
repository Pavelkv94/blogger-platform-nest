//dto для запроса списка юзеров с пагинацией, сортировкой, фильтрами

import { BaseSortablePaginationParams } from "src/core/dto/base.query-params.input-dto";
import { BlogsSortBy } from "./blogs-sort-by";


export class GetBlogsQueryParams extends BaseSortablePaginationParams<BlogsSortBy> {
  sortBy = BlogsSortBy.CreatedAt;
  searchNameTerm: string | null = null;
}